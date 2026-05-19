const express = require('express');
const errorHandler = require('./src/middlewares/errorHandler');
const statsRouter = require('./src/routes/stats');

const app = express();

// Parsear JSON en el body de las peticiones
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'api-node' });
});

// Rutas
app.use('/api/stats', statsRouter);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo centralizado de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
