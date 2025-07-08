require('dotenv').config({path: '.env'});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const createError = require('http-errors');

// Conexión con la BD usando variable de entorno
mongoose
  .connect(process.env.MONGODB_URI)
  .then((x) => {
    console.log(`Conectado a la BD: ${x.connections[0].name}`);
  })
  .catch((error) => {
    console.log('Error de conexión a la BD:', error);
  });

// Configuración del servidor web
const TiendaRoutes = require('./routes/tienda.routes');
const app = express();

// Middlewares de configuración
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     
    extended: false,
}));

// Configurar CORS correctamente
app.use(cors({
  origin: ['https://dulceriaproject.netlify.app', 'http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Dulcería funcionando ✅',
    endpoints: [
      'GET /api/tiendas - Listar productos',
      'POST /api/tiendas - Agregar producto',
      'GET /api/tiendas/:id - Obtener producto',
      'PUT /api/tiendas/:id - Actualizar producto',
      'DELETE /api/tiendas/:id - Eliminar producto'
    ]
  });
});

// IMPORTANTE: Las rutas deben ir ANTES de los manejadores de error
app.use('/api', TiendaRoutes);

// Habilitar el puerto
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
    console.log(`API disponible en: http://localhost:${port}/api/tiendas`);
});

// IMPORTANTE: Los manejadores de error van AL FINAL
// Manejador de error 404 - DEBE IR DESPUÉS de las rutas
app.use((req, res, next) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
    next(createError(404, `Ruta no encontrada: ${req.method} ${req.url}`));
});

// Manejador de errores generales
app.use((err, req, res, next) => {
  console.log('Error:', err.message);
  if (!err.statusCode) err.statusCode = 500;
  
  // Enviar respuesta JSON en lugar de texto plano
  res.status(err.statusCode).json({
    error: true,
    message: err.message,
    status: err.statusCode
  });
});

module.exports = app;
