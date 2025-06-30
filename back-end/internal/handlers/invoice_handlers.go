// internal/handlers/invoice_handlers.go
// Handlers for creating and viewing invoices.
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"salon-management/internal/database"
	// "salon-management/views"
)

// ShowInvoicesPage lists all invoices for the salon owner.
// func ShowInvoicesPage(w http.ResponseWriter, r *http.Request) {
// 	userID := r.Context().Value(UserIDKey).(int)
// 	db := database.GetDB()

// 	rows, err := db.Query(`
//         SELECT i.id, c.name, i.invoice_date, i.total_amount, i.payment_status
//         FROM invoices i
//         JOIN customers c ON i.customer_id = c.id
//         WHERE i.owner_id = ?
//         ORDER BY i.invoice_date DESC
//     `, userID)
// 	if err != nil {
// 		http.Error(w, "Failed to fetch invoices", http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var invoices []views.InvoiceListItem
// 	for rows.Next() {
// 		var item views.InvoiceListItem
// 		if err := rows.Scan(&item.ID, &item.CustomerName, &item.Date, &item.Total, &item.Status); err != nil {
// 			http.Error(w, "Failed to scan invoice", http.StatusInternalServerError)
// 			return
// 		}
// 		invoices = append(invoices, item)
// 	}

// 	views.InvoicesPage(invoices).Render(r.Context(), w)
// }

// ShowNewInvoicePage displays the form to create a new invoice.
// func ShowNewInvoicePage(w http.ResponseWriter, r *http.Request) {
// 	userID := r.Context().Value(UserIDKey).(int)
// 	db := database.GetDB()

// 	rows, err := db.Query("SELECT id, name FROM customers WHERE owner_id = ?", userID)
// 	if err != nil {
// 		http.Error(w, "Failed to fetch customers", http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var customers []views.Customer
// 	for rows.Next() {
// 		var c views.Customer
// 		if err := rows.Scan(&c.ID, &c.Name); err != nil {
// 			http.Error(w, "Failed to scan customer", http.StatusInternalServerError)
// 			return
// 		}
// 		customers = append(customers, c)
// 	}

// 	// Fetch available services for the salon
// 	rows, err = db.Query("SELECT id, name, price FROM services WHERE owner_id = ?", userID)
// 	if err != nil {
// 		http.Error(w, "Failed to fetch services", http.StatusInternalServerError)
// 		return
// 	}
// 	defer rows.Close()

// 	var services []views.Service
// 	for rows.Next() {
// 		var s views.Service
// 		if err := rows.Scan(&s.ID, &s.Name, &s.Price); err != nil {
// 			http.Error(w, "Failed to scan service", http.StatusInternalServerError)
// 			return
// 		}
// 		services = append(services, s)
// 	}

// 	views.NewInvoicePage(customers, services).Render(r.Context(), w)
// }
var id int
// CreateInvoice handles the submission of a new invoice.
func CreateInvoice(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey)
	// var id int
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

	// Simplified for this example. A real implementation would parse services,
	// calculate totals dynamically, and handle discounts/taxes.
	r.ParseForm()
	customerIDStr := r.FormValue("customer_id")
	totalAmountStr := r.FormValue("total_amount")
	paymentStatus := r.FormValue("payment_status")
	discountStr := r.FormValue("discount")
	taxStr := r.FormValue("tax")

	// --- Validation ---
	customerID, err := strconv.Atoi(customerIDStr)
	if err != nil || customerID <= 0 {
		http.Error(w, "Invalid customer ID", http.StatusBadRequest)
		return
	}

	// Check if the customer ID exists for this owner
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM customers WHERE id = ? AND owner_id = ?", customerID, userID).Scan(&count)
	if err != nil {
		http.Error(w, "Failed to validate customer", http.StatusInternalServerError)
		return
	}
	if count == 0 {
		http.Error(w, "Customer not found for this salon", http.StatusBadRequest)
		return
	}

	totalAmount, err := strconv.ParseFloat(totalAmountStr, 64)
	if err != nil || totalAmount <= 0 {
		http.Error(w, "Invalid total amount", http.StatusBadRequest)
		return
	}

	if paymentStatus != "Paid" && paymentStatus != "Unpaid" {
		http.Error(w, "Invalid payment status", http.StatusBadRequest)
		return
	}

	discount, err := strconv.ParseFloat(discountStr, 64)
	if err != nil || discount < 0 || discount > 100 {
		http.Error(w, "Invalid discount", http.StatusBadRequest)
		return
	}

	tax, err := strconv.ParseFloat(taxStr, 64)
	if err != nil || tax < 0 || tax > 100 {
		http.Error(w, "Invalid tax", http.StatusBadRequest)
		return
	}

	// --- Database Insertion ---
	_, err = db.Exec(`
        INSERT INTO invoices (owner_id, customer_id, invoice_date, total_amount, discount, tax, payment_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		userID, customerID, time.Now().Format("2006-01-02"), totalAmount, discount, tax, paymentStatus, time.Now(), time.Now())

	if err != nil {
		http.Error(w, "Failed to create invoice", http.StatusInternalServerError)
		return
	}

	// Redirect to the invoices list
	w.Header().Set("HX-Redirect", "/invoices")
	w.WriteHeader(http.StatusOK)
}

// GetInvoiceDetails displays details for a single invoice.
// func GetInvoiceDetails(w http.ResponseWriter, r *http.Request) {
// 	userID := r.Context().Value(UserIDKey).(int)
// 	idStr := chi.URLParam(r, "id")
// 	id, err := strconv.Atoi(idStr)
// 	if err != nil {
// 		http.Error(w, "Invalid invoice ID", http.StatusBadRequest)
// 		return
// 	}
// 	db := database.GetDB()
// 	// var item views.InvoiceListItem
// 	// err = db.QueryRow(`
//     //     SELECT i.id, c.name, i.invoice_date, i.total_amount, i.payment_status
//     //     FROM invoices i
//     //     JOIN customers c ON i.customer_id = c.id
//     //     WHERE i.id = ? AND i.owner_id = ?`, id, userID).
// 	// 	Scan(&item.ID, &item.CustomerName, &item.Date, &item.Total, &item.Status)
// 	// if err != nil {
// 	// 	http.Error(w, "Invoice not found", http.StatusNotFound)
// 	// 	return
// 	// }
// 	// Render a detail page (implement InvoiceDetailPage in your views)
// 	// views.InvoiceDetailPage(item).Render(r.Context(), w)
// }
