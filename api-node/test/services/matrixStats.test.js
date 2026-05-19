const { computeStats, isDiagonal, flatten } = require('../../src/services/matrixStats');

// Matrices de ejemplo para las pruebas
const Q = [
  [1, 0],
  [0, 1],
];

const R = [
  [2, 3],
  [0, 4],
];

describe('flatten', () => {
  test('aplana una matriz 2x2 correctamente', () => {
    expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });

  test('aplana una matriz 1x3 correctamente', () => {
    expect(flatten([[5, 6, 7]])).toEqual([5, 6, 7]);
  });
});

describe('isDiagonal', () => {
  test('identifica la identidad 2x2 como diagonal', () => {
    expect(isDiagonal([[1, 0], [0, 2]])).toBe(true);
  });

  test('devuelve false para una matriz con elementos fuera de la diagonal', () => {
    expect(isDiagonal([[1, 2], [0, 3]])).toBe(false);
  });

  test('devuelve false para matrices no cuadradas', () => {
    expect(isDiagonal([[1, 0, 0], [0, 1, 0]])).toBe(false);
  });

  test('devuelve false para una matriz vacía', () => {
    expect(isDiagonal([])).toBe(false);
  });

  test('tolera valores cercanos a cero por precisión flotante', () => {
    expect(isDiagonal([[1, 1e-11], [0, 2]])).toBe(true);
  });
});

describe('computeStats', () => {
  test('calcula el máximo correctamente', () => {
    const { max } = computeStats(Q, R);
    // Valores combinados: 1,0,0,1,2,3,0,4 → max = 4
    expect(max).toBe(4);
  });

  test('calcula el mínimo correctamente', () => {
    const { min } = computeStats(Q, R);
    expect(min).toBe(0);
  });

  test('calcula la suma correctamente', () => {
    const { sum } = computeStats(Q, R);
    // 1+0+0+1+2+3+0+4 = 11
    expect(sum).toBe(11);
  });

  test('calcula el promedio correctamente', () => {
    const { average } = computeStats(Q, R);
    // 11 / 8 = 1.375
    expect(average).toBeCloseTo(1.375);
  });

  test('detecta Q como diagonal (identidad)', () => {
    const { diagonals } = computeStats(Q, R);
    expect(diagonals.Q).toBe(true);
  });

  test('detecta R como no diagonal (triangular superior)', () => {
    const { diagonals } = computeStats(Q, R);
    expect(diagonals.R).toBe(false);
  });
});
