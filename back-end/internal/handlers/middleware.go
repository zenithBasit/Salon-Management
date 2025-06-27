// internal/handlers/middleware.go
// Contains the authentication middleware for protected routes.
package handlers

import (
	"context"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "userID"

// AuthMiddleware verifies the JWT token for protected routes.
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie("token")
		if err != nil {
			if err == http.ErrNoCookie {
				// If no token, redirect to login
				http.Redirect(w, r, "/login", http.StatusSeeOther)
				return
			}
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		tokenStr := c.Value
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		// Store userID in context for subsequent handlers
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
