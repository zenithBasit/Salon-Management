// package main

// import (
// 	"fmt"
// 	"log"
// 	"os"
// 	"salon/auth"
// 	"salon/database"
// 	"salon/graphql"

// 	"github.com/joho/godotenv"
// )

// func init() {
// 	godotenv.Load()
// 	auth.Init()
// 	db := database.Connect()
// 	if db == nil {
// 		log.Fatal("Failed to connect to the database")
// 	}
// 	graphql.Init(db)
// }

// // main function to start the application

// func main() {
// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = "8080" // Default port if not set
// 	}

// 	fmt.Printf("Starting server on port %s...\n", port)

// 	// Start the GraphQL server
// 	if err := graphql.StartServer(port); err != nil {
// 		log.Fatalf("Failed to start server: %v", err)
// 	}

// 	// Keep the server running
// 	select {}

// }

// main.go
// This is the main entry point for our application.
// It initializes the database, sets up the web server and routes,
// and starts the background job for sending reminders.

package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"salon-management/internal/database"
	"salon-management/internal/handlers"
	"salon-management/internal/reminders"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not loaded, relying on system environment variables")
	}

	// Initialize the database connection and run migrations
	db, err := database.InitDB("salon.db")
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()
	log.Println("Database initialized and migrations are up-to-date.")

	// Start the background reminder service
	go reminders.StartReminderService(db)
	log.Println("Reminder service started.")

	go func() {
		for {
			err := database.BackupDB()
			if err != nil {
				log.Printf("Database backup failed: %v", err)
			} else {
				log.Println("Database backup completed.")
			}
			time.Sleep(24 * time.Hour)
		}
	}()

	// Create a new router
	r := chi.NewRouter()

	// --- Middleware ---
	// Basic middleware for logging, panic recovery, and request IDs
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// --- Static File Server ---
	// Serves CSS, JS, and image files
	fileServer := http.FileServer(http.Dir("./static/"))
	r.Handle("/static/*", http.StripPrefix("/static/", fileServer))

	// --- Public Routes (No Authentication Required) ---
	// r.Get("/", handlers.ShowLoginPage)
	// r.Get("/login", handlers.ShowLoginPage)
	r.Post("/api/login", handlers.Login)
	// r.Get("/register", handlers.ShowRegisterPage)
	r.Post("/api/register", handlers.Register)
	// r.Get("/api/logout", handlers.Logout)

	// http.HandleFunc("/api/login", handlers.Login)
	// http.HandleFunc("/api/register", handlers.Register)

	// --- Authenticated Routes (Protected Group) ---
	r.Group(func(r chi.Router) {
		r.Use(handlers.AuthMiddleware) // Apply authentication middleware

		// Dashboard
		// r.Get("/dashboard", handlers.ShowDashboard)
		r.Get("/api/dashboard", handlers.APIDashboardStats)

		// Profile Management
		// r.Get("/profile", handlers.ShowProfilePage)
		r.Post("/profile", handlers.UpdateProfile)

		// Customer Management
		// r.Get("/customers", handlers.ShowCustomersPage)
		// r.Post("/customers", handlers.AddCustomer)
		// r.Get("/customers/{id}", handlers.GetCustomer) // For editing
		// r.Put("/customers/{id}", handlers.UpdateCustomer)
		// r.Delete("/customers/{id}", handlers.DeleteCustomer)
		// r.Get("/customers/search", handlers.SearchCustomers)

		// // Invoice Management
		// r.Get("/invoices", handlers.ShowInvoicesPage)
		// r.Get("/invoices/new", handlers.ShowNewInvoicePage)
		r.Post("/invoices", handlers.CreateInvoice)
		// r.Get("/invoices/{id}", handlers.GetInvoiceDetails)

		// Reporting
		// r.Get("/reports", handlers.ShowReportsPage)
		// r.Post("/reports/generate", handlers.GenerateReport)

		// // Settings for reminders
		// r.Get("/settings", handlers.ShowSettingsPage)
		r.Post("/settings/reminders", handlers.UpdateReminderTemplate)

		// Only admins can access sensitive reports
		// r.With(handlers.AdminOnly).Get("/admin/reports", handlers.ShowAdminReports)

		// --- API Routes ---
		r.Get("/api/customers", handlers.APIGetCustomers)
		r.Post("/api/customers", handlers.APIAddCustomer)
		r.Put("/api/customers/{id}", handlers.APIUpdateCustomer)
		r.Delete("/api/customers/{id}", handlers.APIDeleteCustomer)
		// Add PUT for update if needed
	})

	// Start the server
	port := ":8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = ":" + envPort
	}
	log.Printf("Starting server on %s\n", port)
	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
