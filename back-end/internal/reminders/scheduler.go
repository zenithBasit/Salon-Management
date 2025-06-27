// internal/reminders/scheduler.go
// This file contains the logic for the background job that sends reminders.
package reminders

import (
	"database/sql"
	"log"
	"strings"
	"time"

	"os"
	"salon-management/internal/database"

	"github.com/twilio/twilio-go"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
)

// StartReminderService kicks off a daily check for upcoming events.
func StartReminderService(db *sql.DB) {
	// For demonstration, this ticker runs every minute.
	// In production, it should be changed to run once a day. e.g., time.NewTicker(24 * time.Hour)
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		log.Println("Running daily reminder check...")
		checkAndSendReminders(database.GetDB())
	}
}

// checkAndSendReminders queries the DB for events and 'sends' reminders.
func checkAndSendReminders(db *sql.DB) {
	targetDate := time.Now().Add(7 * 24 * time.Hour).Format("01-02") // MM-DD

	// Find customers with a birthday or anniversary on the target date
	query := `
        SELECT c.name, c.phone, o.salon_name, c.owner_id, c.birthday, c.anniversary
        FROM customers c
        JOIN owners o ON c.owner_id = o.id
        WHERE strftime('%m-%d', c.birthday) = ? OR strftime('%m-%d', c.anniversary) = ?
    `
	rows, err := db.Query(query, targetDate, targetDate)
	if err != nil {
		log.Printf("Error querying for reminders: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var customerName, phone, salonName string
		var ownerID int
		var birthday, anniversary string
		if err := rows.Scan(&customerName, &phone, &salonName, &ownerID, &birthday, &anniversary); err != nil {
			log.Printf("Error scanning reminder data: %v", err)
			continue
		}

		// Determine event type
		eventType := ""
		if birthday != "" && strings.HasPrefix(birthday, targetDate) {
			eventType = "birthday"
		} else if anniversary != "" && strings.HasPrefix(anniversary, targetDate) {
			eventType = "anniversary"
		} else {
			eventType = "custom"
		}

		// Fetch the correct template for this owner and event type
		var template string
		err = db.QueryRow(
			"SELECT template FROM reminder_templates WHERE owner_id = ? AND event_type = ?",
			ownerID, eventType,
		).Scan(&template)
		if err != nil || template == "" {
			// fallback to a default template if not found
			template = "Dear [CustomerName], greetings from [SalonName] on your [Event]!"
		}

		sendTwilioReminder(phone, customerName, salonName, template)
	}
}

// sendTwilioReminder sends an SMS or WhatsApp message using Twilio.
func sendTwilioReminder(phone, customerName, salonName, template string) {
	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: os.Getenv("TWILIO_ACCOUNT_SID"),
		Password: os.Getenv("TWILIO_AUTH_TOKEN"),
	})
	message := strings.ReplaceAll(template, "[CustomerName]", customerName)
	message = strings.ReplaceAll(message, "[SalonName]", salonName)
	message = strings.ReplaceAll(message, "[Event]", "special day")

	params := &openapi.CreateMessageParams{}
	params.SetTo(phone)
	params.SetFrom(os.Getenv("TWILIO_PHONE_NUMBER"))
	params.SetBody(message)
	_, err := client.Api.CreateMessage(params)
	if err != nil {
		log.Printf("Twilio send error: %v", err)
	}
}
