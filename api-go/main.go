package main

import (
	"api-go/handlers"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New(fiber.Config{
		AppName: "Matrix QR API v1.0",
	})

	// Middleware: logs de requests y CORS abierto (ajustar en producción)
	app.Use(logger.New())
	app.Use(cors.New())

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "app": "api-go"})
	})

	// Rutas de la API
	api := app.Group("/api")
	matrix := api.Group("/matrix")
	matrix.Post("/qr", handlers.ComputeQR)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("API corriendo en puerto %s", port)
	log.Fatal(app.Listen(":" + port))
}
