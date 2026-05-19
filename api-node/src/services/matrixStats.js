function flatten(matrix) {
  return matrix.reduce((acc, row) => acc.concat(row), []);
}

/**
 * Verifica si una matriz es diagonal.
 * Una matriz es diagonal si todos los elementos fuera de la diagonal principal son cero.
 * Solo aplica a matrices cuadradas; matrices no cuadradas devuelven false.
 * @param {number[][]} matrix
 * @returns {boolean}
 */
function isDiagonal(matrix) {
  const rows = matrix.length;
  if (rows === 0) return false;

  const cols = matrix[0].length;
  if (rows !== cols) return false;

  const EPSILON = 1e-10;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i !== j && Math.abs(matrix[i][j]) > EPSILON) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Calcula estadísticas sobre las matrices Q y R provenientes de la factorización QR.
 * @param {number[][]} Q - Matriz ortogonal
 * @param {number[][]} R - Matriz triangular superior
 * @returns {{
 *   max: number,
 *   min: number,
 *   average: number,
 *   sum: number,
 *   diagonals: { Q: boolean, R: boolean }
 * }}
 */
function computeStats(Q, R) {
  const allValues = [...flatten(Q), ...flatten(R)];

  const sum = allValues.reduce((acc, v) => acc + v, 0);
  const max = allValues.reduce((a, b) => (b > a ? b : a), -Infinity);
  const min = allValues.reduce((a, b) => (b < a ? b : a), Infinity);
  const average = sum / allValues.length;

  return {
    max,
    min,
    average,
    sum,
    diagonals: {
      Q: isDiagonal(Q),
      R: isDiagonal(R),
    },
  };
}

module.exports = { computeStats, isDiagonal, flatten };
