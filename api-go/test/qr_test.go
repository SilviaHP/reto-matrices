package apitest

import (
	"math"
	"testing"

	"api-go/services"
)

func TestComputeQR_ValidMatrix(t *testing.T) {
	input := [][]float64{
		{1, 2, 3},
		{4, 5, 6},
		{7, 8, 9},
	}
	result, err := services.ComputeQR(input)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(result.Q) != 3 || len(result.Q[0]) != 3 {
		t.Errorf("expected Q 3x3, got %dx%d", len(result.Q), len(result.Q[0]))
	}
	if len(result.R) != 3 || len(result.R[0]) != 3 {
		t.Errorf("expected R 3x3, got %dx%d", len(result.R), len(result.R[0]))
	}
}

// Q debe ser ortogonal: Q * Q^T = identidad
func TestComputeQR_OrthogonalQ(t *testing.T) {
	input := [][]float64{
		{12, -51, 4},
		{6, 167, -68},
		{-4, 24, -41},
	}
	result, err := services.ComputeQR(input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	n := len(result.Q)
	const eps = 1e-9
	for i := 0; i < n; i++ {
		for j := 0; j < n; j++ {
			dot := 0.0
			for k := 0; k < n; k++ {
				dot += result.Q[i][k] * result.Q[j][k]
			}
			expected := 0.0
			if i == j {
				expected = 1.0
			}
			if math.Abs(dot-expected) > eps {
				t.Errorf("Q*Q^T[%d][%d] = %f, want %f", i, j, dot, expected)
			}
		}
	}
}

func TestComputeQR_RowsLessThanCols(t *testing.T) {
	input := [][]float64{
		{1, 2, 3},
		{4, 5, 6},
	}
	_, err := services.ComputeQR(input)
	if err == nil {
		t.Fatal("expected error for rows < cols, got nil")
	}
}

func TestComputeQR_EmptyMatrix(t *testing.T) {
	_, err := services.ComputeQR([][]float64{})
	if err == nil {
		t.Fatal("expected error for empty matrix, got nil")
	}
}

func TestComputeQR_InconsistentRowLengths(t *testing.T) {
	input := [][]float64{
		{1, 2, 3},
		{4, 5},
		{7, 8, 9},
	}
	_, err := services.ComputeQR(input)
	if err == nil {
		t.Fatal("expected error for inconsistent row lengths, got nil")
	}
}

func TestComputeQR_NonSquareValid(t *testing.T) {
	input := [][]float64{
		{1, 2},
		{3, 4},
		{5, 6},
		{7, 8},
	}
	result, err := services.ComputeQR(input)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}
	if len(result.Q) == 0 || len(result.R) == 0 {
		t.Fatal("expected non-empty Q and R")
	}
}
