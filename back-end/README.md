# Salon Management System (Go + HTMX)

Welcome to the Salon Management System! This project is a robust, modern web application for managing salon operations, built with Go, HTMX, and Templ. It’s designed for performance, security, reliability, and ease of use.

---

## 🚀 Features

- **Salon Owner Self-Onboarding** (Register/Login)
- **Customer Management** (Add/List/Edit/Delete/Search)
- **Invoice Management** (Create/List/View)
- **Reporting & Analytics** (Revenue, Top Customers)
- **Automated Birthday/Anniversary Reminders** (SMS/WhatsApp-ready)
- **Customizable Reminder Messages**
- **Role-Based Access Control** (Admin-only reports)
- **Daily Automated Backups**
- **Mobile & Desktop Friendly UI**

---

## 🏗️ Tech Stack

- **Backend:** Go (net/http, chi router)
- **Frontend:** HTMX, Tailwind CSS, Templ
- **Database:** SQLite (easy to run anywhere)
- **Templating:** [templ](https://templ.guide/)
- **SMS/WhatsApp:** Ready for Twilio/MessageBird integration

---

## 📦 Project Structure

```
.
├── main.go
├── .env
├── salon.db
├── internal/
│   ├── database/
│   │   └── database.go
│   ├── handlers/
│   │   ├── auth_handlers.go
│   │   ├── customer_handler.go
│   │   ├── dashboard_handlers.go
│   │   └── ...
│   └── reminders/
│       └── scheduler.go
├── views/
│   ├── *.templ
│   └── *_templ.go
├── static/
│   └── (optional static assets)
└── README.md
```

---

## 🛠️ How to Run

### Prerequisites

1. **Go:** Install Go 1.21+ from [golang.org](https://golang.org/dl/)
2. **Templ:** Install the Templ CLI:
   ```bash
   go install github.com/a-h/templ/cmd/templ@latest
   ```

### Steps

1. **Clone the Repository:**
   ```bash
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Generate Template Code:**
   ```bash
   templ generate
   ```
   This compiles `.templ` files into Go code for rendering HTML.

3. **Install Dependencies:**
   ```bash
   go mod tidy
   ```

4. **Run the Application:**
   ```bash
   go run .
   ```

5. **Access the App:**
   Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🌟 Navigating the App

- **Register:** Create a salon owner account.
- **Login:** Access your dashboard.
- **Dashboard:** See key stats at a glance.
- **Customers:** Add, edit, delete, and search customers.
- **Invoices:** Create and view invoices.
- **Reports:** Generate business insights (admins see more!).
- **Settings:** Customize reminder templates.
- **Profile:** Update your salon and owner info.

---

## 🛡️ Non-Functional Requirements & How They’re Addressed

### 1. Performance
- Go’s concurrency and `net/http` handle 100+ users.
- Middleware enforces request timeouts.
- Optimize DB queries as needed.

### 2. Security
- **Role-Based Access Control:** Only admins can access `/admin/reports`.
- **Data Encryption:** (Recommended) Use Go’s `crypto/aes` or [cryptopasta](https://github.com/gtank/cryptopasta) for sensitive fields.
- **Secrets:** Store JWT keys and API tokens in `.env`.

### 3. Reliability
- **Automated Backups:** Daily backup of `salon.db` to `/backup` folder.
- **Uptime:** Deploy on Azure or similar, use process managers for auto-restart.

### 4. Usability
- Responsive UI with Tailwind CSS.
- Mobile and desktop friendly.
- Accessible navigation.

### 5. Integration
- **SMS/WhatsApp:** Ready for Twilio/MessageBird (see `internal/reminders/scheduler.go`).
- **Payments:** Extendable for Stripe/Razorpay integration.

---

## 🔄 Automated Backups

Backups are created daily in the `backup/` directory.  
**To schedule with a system cron job (Linux/macOS):**
```sh
0 2 * * * cp /path/to/salon.db /path/to/backup/salon_$(date +\%Y\%m\%d).db
```
Or let the built-in Go routine handle it (already set up in `main.go`).

---

## 🔑 Environment Variables

Create a `.env` file with:
```
PORT=8080
JWT_SECRET_KEY=your-very-secret-key
# Add any API keys here
```

---

## 📝 Customization & Extending

- **RBAC:** Add roles to the `owners` table and use the provided middleware.
- **Encryption:** Use Go crypto libraries for sensitive data.
- **Integrations:** Plug in Twilio/Stripe as needed.

---

## 💡 Pro Tips

- Use `templ generate` after editing `.templ` files.
- Use `go mod tidy` after adding new dependencies.
- Check logs for backup status and errors.

---

## 📚 Need More?

- See code comments for extension points.
- For SMS/WhatsApp or payment integration code, check the respective handler files or ask for a sample!

---

Happy coding and managing your salon business! 💇‍♀️💅💈