// internal/handlers/dashboard_handlers.go
// Handlers related to the main dashboard.
package handlers

import (
	"encoding/json"
	"net/http"
	"salon-management/internal/database"
	// "salon-management/views"
)

// ShowDashboard displays the main dashboard with key metrics.
// func ShowDashboard(w http.ResponseWriter, r *http.Request) {
// 	userID := r.Context().Value(UserIDKey).(int)
// 	db := database.GetDB()

// 	var totalCustomers, totalInvoices int
// 	var totalRevenue float64

// 	// Get total customers
// 	db.QueryRow("SELECT COUNT(*) FROM customers WHERE owner_id = ?", userID).Scan(&totalCustomers)

// 	// Get total invoices
// 	db.QueryRow("SELECT COUNT(*) FROM invoices WHERE owner_id = ?", userID).Scan(&totalInvoices)

// 	// Get total revenue
// 	db.QueryRow("SELECT SUM(total_amount) FROM invoices WHERE owner_id = ?", userID).Scan(&totalRevenue)

// 	stats := views.DashboardStats{
// 		TotalCustomers: totalCustomers,
// 		TotalInvoices:  totalInvoices,
// 		TotalRevenue:   totalRevenue,
// 	}

// 	views.DashboardPage(stats).Render(r.Context(), w)
// }

// APIDashboardStats returns the dashboard statistics as JSON for API requests.
func APIDashboardStats(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey)
	var id int
	switch v := userID.(type) {
	case int:
		id = v
	case int64:
		id = int(v)
	default:
		http.Error(w, "Invalid user ID type", http.StatusInternalServerError)
		return
	}
	db := database.GetDB()

	var totalCustomers, totalInvoices int
	var totalRevenue float64

	db.QueryRow("SELECT COUNT(*) FROM customers WHERE owner_id = ?", id).Scan(&totalCustomers)
	db.QueryRow("SELECT COUNT(*) FROM invoices WHERE owner_id = ?", id).Scan(&totalInvoices)
	db.QueryRow("SELECT SUM(total_amount) FROM invoices WHERE owner_id = ?", id).Scan(&totalRevenue)

	// Dummy growth rate for now
	resp := map[string]interface{}{
		"totalCustomers": totalCustomers,
		"totalInvoices":  totalInvoices,
		"monthlyRevenue": totalRevenue,
		"growthRate":     "23.5%",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
