// internal/handlers/auth_handlers.go
// Handles user registration, login, logout, and the authentication middleware.
package handlers

import (
	"database/sql"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"net/mail"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"salon-management/internal/database"
	"salon-management/views"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

type Claims struct {
	UserID int
	jwt.RegisteredClaims
}

// ShowRegisterPage renders the registration form.
func ShowRegisterPage(w http.ResponseWriter, r *http.Request) {
	views.RegisterPage().Render(r.Context(), w)
}

// Register handles new salon owner creation.
func Register(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	name := strings.TrimSpace(r.FormValue("name"))
	phone := strings.TrimSpace(r.FormValue("phone"))
	address := strings.TrimSpace(r.FormValue("address"))
	email := strings.TrimSpace(r.FormValue("email"))
	password := r.FormValue("password")
	salonName := strings.TrimSpace(r.FormValue("salonName"))

	// Validation
	if name == "" || email == "" || password == "" || salonName == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}
	if len(name) > 100 {
		http.Error(w, "Name is too long (max 100 characters)", http.StatusBadRequest)
		return
	}
	if len(salonName) > 100 {
		http.Error(w, "Salon name is too long (max 100 characters)", http.StatusBadRequest)
		return
	}
	if address == "" || len(address) < 10 {
		http.Error(w, "Address is required and must be at least 10 characters", http.StatusBadRequest)
		return
	}
	if len(address) > 200 {
		http.Error(w, "Address is too long (max 200 characters)", http.StatusBadRequest)
		return
	}
	// Phone: E.164 format, starts with +, 10-15 digits, country code required
	phoneRegex := regexp.MustCompile(`^\+[1-9]\d{9,14}$`)
	if !phoneRegex.MatchString(phone) {
		http.Error(w, "Phone must be in international format (e.g. +12345678901)", http.StatusBadRequest)
		return
	}
	if _, err := mail.ParseAddress(email); err != nil {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}
	// Password: min 8, max 64, at least one uppercase, one lowercase, one digit, one special char
	if len(password) < 8 || len(password) > 64 {
		http.Error(w, "Password must be 8-64 characters", http.StatusBadRequest)
		return
	}
	if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
		http.Error(w, "Password must contain at least one uppercase letter", http.StatusBadRequest)
		return
	}
	if !regexp.MustCompile(`[a-z]`).MatchString(password) {
		http.Error(w, "Password must contain at least one lowercase letter", http.StatusBadRequest)
		return
	}
	if !regexp.MustCompile(`[0-9]`).MatchString(password) {
		http.Error(w, "Password must contain at least one digit", http.StatusBadRequest)
		return
	}
	if !regexp.MustCompile(`[!@#~$%^&*()_+\-={}\[\]:;"'<>,.?/\\|]`).MatchString(password) {
		http.Error(w, "Password must contain at least one special character", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Server error, unable to create your account.", http.StatusInternalServerError)
		return
	}

	db := database.GetDB()
	_, err = db.Exec(`
		INSERT INTO owners (name, phone, address, email, password_hash, salon_name, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, name, phone, address, email, string(hashedPassword), salonName, time.Now(), time.Now())

	if err != nil {
		http.Error(w, "Email already exists.", http.StatusBadRequest)
		return
	}

	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

// ShowLoginPage renders the login form.
func ShowLoginPage(w http.ResponseWriter, r *http.Request) {
	views.LoginPage().Render(r.Context(), w)
}

// Login handles user authentication.
func Login(w http.ResponseWriter, r *http.Request) {
	r.ParseForm()
	email := r.FormValue("email")
	password := r.FormValue("password")
	if email == "" || password == "" {
		http.Error(w, "Email and password required", http.StatusBadRequest)
		return
	}
	if _, err := mail.ParseAddress(email); err != nil {
		http.Error(w, "Invalid email", http.StatusBadRequest)
		return
	}

	var ownerID int
	var storedPasswordHash string

	db := database.GetDB()
	err := db.QueryRow("SELECT id, password_hash FROM owners WHERE email = ?", email).Scan(&ownerID, &storedPasswordHash)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(storedPasswordHash), []byte(password))
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: ownerID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Server error, unable to create token", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   tokenString,
		Expires: expirationTime,
		Path:    "/",
	})

	// Set HX-Redirect header for HTMX
	w.Header().Set("HX-Redirect", "/dashboard")
	w.WriteHeader(http.StatusOK)
}

// Logout clears the authentication cookie.
func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:    "token",
		Value:   "",
		Expires: time.Now().Add(-1 * time.Hour), // Expire in the past
		Path:    "/",
	})
	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

func AdminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(UserIDKey).(int)
		db := database.GetDB()
		var role string
		err := db.QueryRow("SELECT role FROM owners WHERE id = ?", userID).Scan(&role)
		if err != nil || role != "admin" {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
