package apitest

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"api-go/handlers"

	"github.com/gofiber/fiber/v2"
)

func newTestApp() *fiber.App {
	app := fiber.New()
	app.Post("/api/matrix/qr", handlers.ComputeQR)
	return app
}

func TestHandler_ValidMatrix(t *testing.T) {
	app := newTestApp()

	body, _ := json.Marshal(map[string]interface{}{
		"matrix": [][]float64{
			{1, 2},
			{3, 4},
			{5, 6},
		},
	})

	req := httptest.NewRequest(http.MethodPost, "/api/matrix/qr", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	// Retorna 200 con qr (y warning si api-node no está disponible)
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}
}

func TestHandler_EmptyMatrix(t *testing.T) {
	app := newTestApp()

	body, _ := json.Marshal(map[string]interface{}{
		"matrix": [][]float64{},
	})

	req := httptest.NewRequest(http.MethodPost, "/api/matrix/qr", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestHandler_InvalidBody(t *testing.T) {
	app := newTestApp()

	req := httptest.NewRequest(http.MethodPost, "/api/matrix/qr", bytes.NewReader([]byte("not-json")))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestHandler_RowsLessThanCols(t *testing.T) {
	app := newTestApp()

	body, _ := json.Marshal(map[string]interface{}{
		"matrix": [][]float64{
			{1, 2, 3},
			{4, 5, 6},
		},
	})

	req := httptest.NewRequest(http.MethodPost, "/api/matrix/qr", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusUnprocessableEntity {
		t.Errorf("expected 422, got %d", resp.StatusCode)
	}
}
