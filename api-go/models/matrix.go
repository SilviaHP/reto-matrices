package models

// MatrixRequest es el body de entrada: array de arrays de números.
type MatrixRequest struct {
	Matrix [][]float64 `json:"matrix"`
}

// QRResult contiene las matrices Q y R resultantes de la factorización QR.
type QRResult struct {
	Q [][]float64 `json:"Q"`
	R [][]float64 `json:"R"`
}

// NodeResponse es la respuesta que devuelve la API Node.js con las estadísticas.
type NodeResponse struct {
	Max        float64            `json:"max"`
	Min        float64            `json:"min"`
	Average    float64            `json:"average"`
	Sum        float64            `json:"sum"`
	Diagonals  map[string]bool    `json:"diagonals"`
}

// APIResponse es la respuesta final al cliente con QR + estadísticas.
type APIResponse struct {
	QR    QRResult     `json:"qr"`
	Stats NodeResponse `json:"stats"`
}
