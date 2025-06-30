package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"net/mail"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"salon-management/internal/database"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

type Claims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

type RegisterRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	SalonName string `json:"salon_name"`
	Address   string `json:"address"`
	Password  string `json:"password"`
}

type RegisterResponse struct {
	Token   string `json:"token,omitempty"`
	Message string `json:"message,omitempty"`
}

// Register handles new salon owner creation.
func Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(RegisterResponse{Message: "Invalid request"})
		return
	}
	name := strings.TrimSpace(req.FirstName + " " + req.LastName)
	phone := strings.TrimSpace(req.Phone)
	address := strings.TrimSpace(req.Address)
	email := strings.TrimSpace(req.Email)
	password := req.Password
	salonName := strings.TrimSpace(req.SalonName)

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
	res, err := db.Exec(`
        INSERT INTO owners (name, phone, address, email, password_hash, salon_name, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		name, phone, address, email, string(hashedPassword), salonName, time.Now(), time.Now())
	if err != nil {
		http.Error(w, "Email already exists.", http.StatusBadRequest)
		return
	}
	id, _ := res.LastInsertId()

	token, err := generateJWT(id, email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(RegisterResponse{Message: "Could not generate token"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(RegisterResponse{Token: token})
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token   string `json:"token,omitempty"`
	Message string `json:"message,omitempty"`
}

// Login handles user authentication.
func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(LoginResponse{Message: "Invalid request"})
		return
	}
	user, err := database.GetUserByEmail(req.Email)
	if err != nil || !user.CheckPassword(req.Password) {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(LoginResponse{Message: "Invalid email or password"})
		return
	}
	token, err := generateJWT(user.ID, user.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(LoginResponse{Message: "Could not generate token"})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(LoginResponse{Token: token})
}

func generateJWT(userID int64, email string) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}
