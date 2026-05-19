const express = require('express');
const router = express.Router();
const { computeStats } = require('../services/matrixStats');

/**
 * POST /api/stats
 * Recibe las matrices Q y R de la API en Go y devuelve estadísticas calculadas.
 *
 * Body esperado:
 *   { "Q": number[][], "R": number[][] }
 *
 * Respuesta:
 *   { max, min, average, sum, diagonals: { Q: boolean, R: boolean } }
 */
router.post('/', (req, res, next) => {
  try {
    const { Q, R } = req.body;

    if (!Array.isArray(Q) || !Array.isArray(R)) {
      return res.status(400).json({
        error: 'Se requieren las matrices Q y R como arrays de arrays.',
      });
    }

    if (Q.length === 0 || R.length === 0) {
      return res.status(400).json({
        error: 'Las matrices Q y R no pueden estar vacías.',
      });
    }

    const isValidMatrix = (matrix) =>
      matrix.every(
        (row) =>
          Array.isArray(row) &&
          row.length > 0 &&
          row.every((v) => typeof v === 'number' && isFinite(v))
      );

    if (!isValidMatrix(Q) || !isValidMatrix(R)) {
      return res.status(400).json({
        error: 'Cada fila de Q y R debe ser un array de números finitos.',
      });
    }

    const stats = computeStats(Q, R);
    return res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
