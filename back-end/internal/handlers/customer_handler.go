package handlers

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"salon-management/internal/database"

	"net/mail"
	"regexp"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
)

var encryptionKey []byte

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or failed to load .env file. Relying on system environment variables.")
	}
	keyHex := os.Getenv("ENCRYPTION_KEY")
	var err error
	encryptionKey, err = hex.DecodeString(keyHex)
	if err != nil || len(encryptionKey) != 32 {
		log.Fatalf("ENCRYPTION_KEY must be a 64-character hex string (32 bytes), got %d bytes", len(encryptionKey))
	}
	log.Println("ENCRYPTION_KEY loaded successfully.")
}

func encryptField(plain string) ([]byte, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return nil, err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	ciphertext := aesGCM.Seal(nonce, nonce, []byte(plain), nil)
	return ciphertext, nil
}

func decryptField(ciphertext []byte) (string, error) {
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := aesGCM.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", io.ErrUnexpectedEOF
	}
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
	plain, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}
	return string(plain), nil
}

// --- API: List Customers ---
func APIGetCustomers(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	db := database.GetDB()
	rows, err := db.Query("SELECT id, name, phone, email, birthday, anniversary FROM customers WHERE owner_id = ?", userID)
	if err != nil {
		http.Error(w, "Failed to fetch customers", http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	type Customer struct {
		ID          int    `json:"id"`
		Name        string `json:"name"`
		Phone       string `json:"phone"`
		Email       string `json:"email"`
		Birthday    string `json:"birthday,omitempty"`
		Anniversary string `json:"anniversary,omitempty"`
	}
	customers := []Customer{}
	for rows.Next() {
		var c Customer
		var birthday, anniversary sql.NullString
		var encryptedPhone, encryptedEmail []byte
		if err := rows.Scan(&c.ID, &c.Name, &encryptedPhone, &encryptedEmail, &birthday, &anniversary); err != nil {
			log.Printf("Failed to scan customer: %v", err)
			continue
		}
		if phone, err := decryptField(encryptedPhone); err == nil {
			c.Phone = phone
		}
		if email, err := decryptField(encryptedEmail); err == nil {
			c.Email = email
		}
		if birthday.Valid {
			c.Birthday = birthday.String
		}
		if anniversary.Valid {
			c.Anniversary = anniversary.String
		}
		customers = append(customers, c)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customers)
}

// --- API: Add Customer ---
func APIAddCustomer(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	var c struct {
		Name        string `json:"name"`
		Phone       string `json:"phone"`
		Email       string `json:"email"`
		Birthday    string `json:"birthday"`
		Anniversary string `json:"anniversary"`
	}
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if c.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if c.Phone != "" {
		phoneRegex := regexp.MustCompile(`^[0-9 +()-]*$`)
		if !phoneRegex.MatchString(c.Phone) {
			http.Error(w, "Invalid phone number format", http.StatusBadRequest)
			return
		}
	}
	if c.Email != "" {
		if _, err := mail.ParseAddress(c.Email); err != nil {
			http.Error(w, "Invalid email address", http.StatusBadRequest)
			return
		}
	}
	if c.Birthday != "" {
		if _, err := time.Parse("2006-01-02", c.Birthday); err != nil {
			http.Error(w, "Invalid birthday format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	}
	if c.Anniversary != "" {
		if _, err := time.Parse("2006-01-02", c.Anniversary); err != nil {
			http.Error(w, "Invalid anniversary format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	}
	encryptedPhone, err := encryptField(c.Phone)
	if err != nil {
		http.Error(w, "Failed to encrypt phone", http.StatusInternalServerError)
		return
	}
	encryptedEmail, err := encryptField(c.Email)
	if err != nil {
		http.Error(w, "Failed to encrypt email", http.StatusInternalServerError)
		return
	}
	db := database.GetDB()
	res, err := db.Exec(
		"INSERT INTO customers (name, phone, email, birthday, anniversary, owner_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		c.Name, encryptedPhone, encryptedEmail, c.Birthday, c.Anniversary, userID, time.Now(),
	)
	if err != nil {
		http.Error(w, "Failed to add customer", http.StatusInternalServerError)
		return
	}
	id, _ := res.LastInsertId()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id})
}

// --- API: Update Customer ---
func APIUpdateCustomer(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid customer ID", http.StatusBadRequest)
		return
	}
	var c struct {
		Name        string `json:"name"`
		Phone       string `json:"phone"`
		Email       string `json:"email"`
		Birthday    string `json:"birthday"`
		Anniversary string `json:"anniversary"`
	}
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	if c.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}
	if c.Phone != "" {
		phoneRegex := regexp.MustCompile(`^[0-9 +()-]*$`)
		if !phoneRegex.MatchString(c.Phone) {
			http.Error(w, "Invalid phone number format", http.StatusBadRequest)
			return
		}
	}
	if c.Email != "" {
		if _, err := mail.ParseAddress(c.Email); err != nil {
			http.Error(w, "Invalid email address", http.StatusBadRequest)
			return
		}
	}
	if c.Birthday != "" {
		if _, err := time.Parse("2006-01-02", c.Birthday); err != nil {
			http.Error(w, "Invalid birthday format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	}
	if c.Anniversary != "" {
		if _, err := time.Parse("2006-01-02", c.Anniversary); err != nil {
			http.Error(w, "Invalid anniversary format (YYYY-MM-DD)", http.StatusBadRequest)
			return
		}
	}
	encryptedPhone, err := encryptField(c.Phone)
	if err != nil {
		http.Error(w, "Failed to encrypt phone", http.StatusInternalServerError)
		return
	}
	encryptedEmail, err := encryptField(c.Email)
	if err != nil {
		http.Error(w, "Failed to encrypt email", http.StatusInternalServerError)
		return
	}
	db := database.GetDB()
	_, err = db.Exec(
		"UPDATE customers SET name=?, phone=?, email=?, birthday=?, anniversary=?, updated_at=? WHERE id=? AND owner_id=?",
		c.Name, encryptedPhone, encryptedEmail, c.Birthday, c.Anniversary, time.Now(), id, userID,
	)
	if err != nil {
		http.Error(w, "Failed to update customer", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// --- API: Delete Customer ---
func APIDeleteCustomer(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid customer ID", http.StatusBadRequest)
		return
	}
	db := database.GetDB()
	_, err = db.Exec("DELETE FROM customers WHERE id = ? AND owner_id = ?", id, userID)
	if err != nil {
		http.Error(w, "Failed to delete customer", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// --- API: Get Single Customer ---
func APIGetCustomer(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid customer ID", http.StatusBadRequest)
		return
	}
	db := database.GetDB()
	var c struct {
		ID          int    `json:"id"`
		Name        string `json:"name"`
		Phone       string `json:"phone"`
		Email       string `json:"email"`
		Birthday    string `json:"birthday,omitempty"`
		Anniversary string `json:"anniversary,omitempty"`
	}
	var birthday, anniversary sql.NullString
	var encryptedPhone, encryptedEmail []byte
	err = db.QueryRow(
		"SELECT id, name, phone, email, birthday, anniversary FROM customers WHERE id = ? AND owner_id = ?",
		id, userID,
	).Scan(&c.ID, &c.Name, &encryptedPhone, &encryptedEmail, &birthday, &anniversary)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Customer not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch customer", http.StatusInternalServerError)
		}
		return
	}
	if phone, err := decryptField(encryptedPhone); err == nil {
		c.Phone = phone
	}
	if email, err := decryptField(encryptedEmail); err == nil {
		c.Email = email
	}
	if birthday.Valid {
		c.Birthday = birthday.String
	}
	if anniversary.Valid {
		c.Anniversary = anniversary.String
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(c)
}
