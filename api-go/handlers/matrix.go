package handlers

import (
	"api-go/models"
	"api-go/services"
	"github.com/gofiber/fiber/v2"
)

// ComputeQR maneja POST /api/matrix/qr
// Recibe una matriz rectangular, calcula su factorización QR,
// envía el resultado a la API Node.js y devuelve la respuesta combinada.
func ComputeQR(c *fiber.Ctx) error {
	var req models.MatrixRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "cuerpo de la petición inválido",
		})
	}

	if len(req.Matrix) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "la matriz no puede estar vacía",
		})
	}

	qr, err := services.ComputeQR(req.Matrix)
	if err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"error": "error en factorización QR: " + err.Error(),
		})
	}

	// Enviar matrices Q y R a la API Node.js para estadísticas
	stats, err := services.SendToNodeAPI(qr)
	if err != nil {
		// Devolver QR aunque Node.js no esté disponible
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"qr":      qr,
			"warning": "API Node.js no disponible: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(models.APIResponse{
		QR:    qr,
		Stats: stats,
	})
}
