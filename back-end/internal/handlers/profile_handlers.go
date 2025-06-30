// internal/handlers/profile_handlers.go
// Handlers for salon owner profile management.
package handlers

import (
	"net/http"
	"salon-management/internal/database"

	// "salon-management/views"
	"time"
)

// ShowProfilePage displays the salon owner's profile for editing.
// func ShowProfilePage(w http.ResponseWriter, r *http.Request) {
// 	userID := r.Context().Value(UserIDKey).(int)
// 	db := database.GetDB()

// 	var owner views.OwnerProfile
// 	err := db.QueryRow("SELECT id, name, email, phone, salon_name, address FROM owners WHERE id = ?", userID).Scan(
// 		&owner.ID, &owner.Name, &owner.Email, &owner.Phone, &owner.SalonName, &owner.Address)

// 	if err != nil {
// 		http.Error(w, "Could not load profile", http.StatusInternalServerError)
// 		return
// 	}

// 	views.ProfilePage(owner).Render(r.Context(), w)
// }

// UpdateProfile handles the form submission for updating the profile.
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	db := database.GetDB()

	r.ParseForm()
	name := r.FormValue("name")
	phone := r.FormValue("phone")
	salonName := r.FormValue("salonName")
	address := r.FormValue("address")

	_, err := db.Exec(`
        UPDATE owners SET name = ?, phone = ?, salon_name = ?, address = ?, updated_at = ?
        WHERE id = ?`,
		name, phone, salonName, address, time.Now(), userID)

	if err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	// Show a success message
	w.Write([]byte(`<div class="text-green-500">Profile updated successfully!</div>`))
}
