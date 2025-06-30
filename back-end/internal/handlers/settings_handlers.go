// internal/handlers/settings_handlers.go
package handlers

import (
	"net/http"
	"salon-management/internal/database"
	// "salon-management/views"
)

// ShowSettingsPage displays settings, including the reminder template.
// func ShowSettingsPage(w http.ResponseWriter, r *http.Request) {
// 	userID := r.Context().Value(UserIDKey).(int)
// 	db := database.GetDB()

// 	var template string
// 	db.QueryRow("SELECT reminder_template FROM owners WHERE id = ?", userID).Scan(&template)

// 	var templates []views.ReminderTemplate
// 	rows, err := db.Query("SELECT id, owner_id, event_type, template FROM reminder_templates WHERE owner_id = ?", userID)
// 	if err == nil {
// 		for rows.Next() {
// 			var t views.ReminderTemplate
// 			if err := rows.Scan(&t.ID, &t.OwnerID, &t.EventType, &t.Template); err == nil {
// 				templates = append(templates, t)
// 			}
// 		}
// 	}

// 	views.ReminderTemplatesPage(templates).Render(r.Context(), w)
// }

// UpdateReminderTemplate saves the new reminder message.
func UpdateReminderTemplate(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	db := database.GetDB()
	r.ParseForm()
	eventType := r.FormValue("event_type")
	template := r.FormValue("template")

	// Upsert logic: insert if not exists, else update
	_, err := db.Exec(`
        INSERT INTO reminder_templates (owner_id, event_type, template)
        VALUES (?, ?, ?)
        ON CONFLICT(owner_id, event_type) DO UPDATE SET template=excluded.template
    `, userID, eventType, template)
	if err != nil {
		http.Error(w, "Failed to save template", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`<div class="text-green-500 mt-2">Template saved!</div>`))
}
