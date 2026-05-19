package services

import (
	"api-go/models"
	"fmt"

	"gonum.org/v1/gonum/mat"
)

// ComputeQR realiza la factorización QR de la matriz de entrada.
// Recibe un [][]float64 (matriz rectangular) y devuelve las matrices Q y R.
func ComputeQR(input [][]float64) (models.QRResult, error) {
	rows := len(input)
	if rows == 0 {
		return models.QRResult{}, fmt.Errorf("la matriz no puede estar vacía")
	}
	cols := len(input[0])
	if cols == 0 {
		return models.QRResult{}, fmt.Errorf("las filas de la matriz no pueden estar vacías")
	}

	if rows < cols {
		return models.QRResult{}, fmt.Errorf("QR requiere rows >= cols, recibido %dx%d", rows, cols)
	}

	for i, row := range input {
		if len(row) != cols {
			return models.QRResult{}, fmt.Errorf("fila %d tiene longitud inconsistente", i)
		}
	}

	// Aplanar la matriz para gonum (row-major order)
	data := make([]float64, rows*cols)
	for i, row := range input {
		for j, val := range row {
			data[i*cols+j] = val
		}
	}

	A := mat.NewDense(rows, cols, data)

	var qr mat.QR
	qr.Factorize(A)

	// Extraer matriz Q (rows x rows) cuadrada octogonal
	var Q mat.Dense
	qr.QTo(&Q)

	// Extraer matriz R (rows x cols) triangular superior
	var R mat.Dense
	qr.RTo(&R)

	qRows, qCols := Q.Dims()
	qMatrix := make([][]float64, qRows)
	for i := range qMatrix {
		qMatrix[i] = make([]float64, qCols)
		for j := range qMatrix[i] {
			qMatrix[i][j] = Q.At(i, j)
		}
	}

	rRows, rCols := R.Dims()
	rMatrix := make([][]float64, rRows)
	for i := range rMatrix {
		rMatrix[i] = make([]float64, rCols)
		for j := range rMatrix[i] {
			rMatrix[i][j] = R.At(i, j)
		}
	}

	return models.QRResult{Q: qMatrix, R: rMatrix}, nil
}
