// package database

// import (
// 	"fmt"
// 	"log"
// 	"os"

// 	"github.com/joho/godotenv"
// 	"gorm.io/driver/postgres"
// 	"gorm.io/gorm"
// 	"gorm.io/gorm/logger"
// )

// func Connect() *gorm.DB {
// 	// Load environment variables from .env file
// 	err := godotenv.Load()
// 	if err != nil {
// 		log.Fatalf("Error loading .env file: %v", err)
// 	}
// 	dsn := os.Getenv("db")
// 	if dsn == "" {
// 		log.Fatal("Database connection string is not set")
// 	}
// 	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
// 		Logger: logger.Default.LogMode(logger.Info),
// 	})
// 	if err != nil {
// 		log.Fatalf("Failed to connect to the database: %v", err)
// 	}

// 	fmt.Println("Connected to the database successfully")
// 	return db
// }

// internal/database/db.go
// This file handles database initialization and migrations.
package database

import (
	"database/sql"
	"io"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3" // SQLite driver
)

var db *sql.DB

// InitDB initializes the database connection and runs all migrations.
func InitDB(filepath string) (*sql.DB, error) {
	var err error
	db, err = sql.Open("sqlite3", filepath)
	if err != nil {
		return nil, err
	}
	if err = db.Ping(); err != nil {
		return nil, err
	}

	if err = createTables(); err != nil {
		db.Close()
		log.Printf("Error creating tables: %v", err)
		// Close the database connection if table creation fails
		// This ensures we don't leave an open connection in case of an error
		return nil, err
	}

	return db, nil
}

// GetDB returns the database connection pool.
func GetDB() *sql.DB {
	return db
}

// createTables defines and executes the SQL for creating the database schema.
func createTables() error {
	createOwnerTableSQL := `
	CREATE TABLE IF NOT EXISTS owners (
		"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"name" TEXT,
		"email" TEXT NOT NULL UNIQUE,
		"phone" TEXT,
		"password_hash" TEXT NOT NULL,
		"salon_name" TEXT,
		"address" TEXT,
		"reminder_template" TEXT DEFAULT 'Hi [CustomerName], wishing you a happy [Event] from [SalonName]!',
		"created_at" DATETIME,
		"updated_at" DATETIME
	);`

	createCustomerTableSQL := `
	CREATE TABLE IF NOT EXISTS customers (
		"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"owner_id" INTEGER NOT NULL,
		"name" TEXT NOT NULL,
		"phone" TEXT,
		"email" TEXT,
		"birthday" DATE,
		"anniversary" DATE,
		"created_at" DATETIME,
		"updated_at" DATETIME,
		FOREIGN KEY(owner_id) REFERENCES owners(id)
	);`

	createInvoiceTableSQL := `
	CREATE TABLE IF NOT EXISTS invoices (
		"id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"owner_id" INTEGER NOT NULL,
		"customer_id" INTEGER NOT NULL,
		"invoice_date" DATE NOT NULL,
		"total_amount" REAL NOT NULL,
		"discount" REAL DEFAULT 0,
		"tax" REAL DEFAULT 0,
		"payment_status" TEXT NOT NULL,
		"created_at" DATETIME,
		"updated_at" DATETIME,
		FOREIGN KEY(owner_id) REFERENCES owners(id),
		FOREIGN KEY(customer_id) REFERENCES customers(id)
	);`

	// Add more tables for services, invoice_items etc. in a full application

	log.Println("Creating tables...")
	if _, err := db.Exec(createOwnerTableSQL); err != nil {
		return err
	}
	if _, err := db.Exec(createCustomerTableSQL); err != nil {
		return err
	}
	if _, err := db.Exec(createInvoiceTableSQL); err != nil {
		return err
	}
	log.Println("Tables created successfully or already exist.")
	return nil
}
func BackupDB() error {
	// Ensure the backup directory exists
	if _, err := os.Stat("backup"); os.IsNotExist(err) {
		if err := os.Mkdir("backup", 0755); err != nil {
			return err
		}
	}
	src, err := os.Open("salon.db")
	if err != nil {
		return err
	}
	defer src.Close()
	dst, err := os.Create("backup/salon_" + time.Now().Format("20060102") + ".db")
	if err != nil {
		return err
	}
	defer dst.Close()
	_, err = io.Copy(dst, src)
	return err
}
