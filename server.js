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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
    extended: false,
}));

app.use(cors());

app.use('/api', TiendaRoutes);

app.get('/', (req, res) => {
  res.send('API de Dulcería funcionando ✅');
});

// Habilitar el puerto
const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto: ${port}`);
})

// Manejador de error 404
app.use((req, res, next) => {
    next(createError(404))
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.log(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message)
});

module.exports = app;