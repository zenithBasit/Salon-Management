// internal/handlers/report_handlers.go
// Handlers for generating and displaying reports.
package handlers

import (
	"net/http"
	"salon-management/internal/database"
	"salon-management/views"
)

// ShowReportsPage displays the reporting interface.
func ShowReportsPage(w http.ResponseWriter, r *http.Request) {
	views.ReportsPage().Render(r.Context(), w)
}

// ShowAdminReports displays sensitive admin-only reports.
func ShowAdminReports(w http.ResponseWriter, r *http.Request) {
	// You can reuse the normal reports page or create a special one for admins
	views.ReportsPage().Render(r.Context(), w)
}

// GenerateReport creates and displays a report based on user criteria.
func GenerateReport(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	db := database.GetDB()
	r.ParseForm()

	reportType := r.FormValue("report_type")
	startDate := r.FormValue("start_date")
	endDate := r.FormValue("end_date")

	var results []views.ReportRow
	var query string

	// In a real application, you'd have more robust query building.
	// This is a simplified example.
	switch reportType {
	case "revenue":
		query = `
            SELECT strftime('%Y-%m', invoice_date) as label, SUM(total_amount) as value
            FROM invoices
            WHERE owner_id = ? AND invoice_date BETWEEN ? AND ?
            GROUP BY label
            ORDER BY label`
		rows, err := db.Query(query, userID, startDate, endDate)
		if err != nil {
			http.Error(w, "Failed to generate report", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var row views.ReportRow
			if err := rows.Scan(&row.Label, &row.Value); err != nil {
				http.Error(w, "Failed to scan report row", http.StatusInternalServerError)
				return
			}
			results = append(results, row)
		}

	case "top_customers":
		query = `
            SELECT c.name as label, SUM(i.total_amount) as value
            FROM invoices i
            JOIN customers c ON i.customer_id = c.id
            WHERE i.owner_id = ? AND i.invoice_date BETWEEN ? AND ?
            GROUP BY c.name
            ORDER BY value DESC
            LIMIT 10`
		rows, err := db.Query(query, userID, startDate, endDate)
		if err != nil {
			http.Error(w, "Failed to generate report", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var row views.ReportRow
			if err := rows.Scan(&row.Label, &row.Value); err != nil {
				http.Error(w, "Failed to scan report row", http.StatusInternalServerError)
				return
			}
			results = append(results, row)
		}

	default:
		http.Error(w, "Invalid report type", http.StatusBadRequest)
		return
	}

	views.ReportResults(reportType, results).Render(r.Context(), w)
}
