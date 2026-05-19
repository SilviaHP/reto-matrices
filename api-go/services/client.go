package services

import (
	"api-go/models"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// SendToNodeAPI envía las matrices Q y R a la API Node.js
// y devuelve las estadísticas calculadas por dicha API.
func SendToNodeAPI(qr models.QRResult) (models.NodeResponse, error) {
	nodeURL := os.Getenv("NODE_API_URL")
	if nodeURL == "" {
		nodeURL = "http://localhost:3000"
	}

	body, err := json.Marshal(qr)
	if err != nil {
		return models.NodeResponse{}, fmt.Errorf("error serializando resultado QR: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(nodeURL+"/api/stats", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return models.NodeResponse{}, fmt.Errorf("error llamando API Node.js: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return models.NodeResponse{}, fmt.Errorf("API Node.js respondió con status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return models.NodeResponse{}, fmt.Errorf("error leyendo respuesta de Node.js: %w", err)
	}

	var nodeResp models.NodeResponse
	if err := json.Unmarshal(data, &nodeResp); err != nil {
		return models.NodeResponse{}, fmt.Errorf("error parseando respuesta de Node.js: %w", err)
	}

	return nodeResp, nil
}
