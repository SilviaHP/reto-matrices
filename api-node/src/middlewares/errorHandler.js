/**
 * Middleware de manejo centralizado de errores.
 * Captura cualquier error propagado con next(err) y responde con JSON uniforme.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  console.error('[Error]', err.stack || err.message);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Error interno del servidor',
  });
}

module.exports = errorHandler;
