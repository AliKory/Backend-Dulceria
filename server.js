const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const createError = require('http-errors');

// Conexión con la BD
mongoose
   .connect('mongodb+srv://alisonhmti22:VCf382DTWRv0neKQ@tiendas.2f7jdxm.mongodb.net/?retryWrites=true&w=majority&appName=tiendas')
  .then((x) => {
    console.log('Conectado a la BD:', x.connections[0].name);
  })
  .catch((error) => {
    console.log('Error de conexión a la BD:', error);
  });

// Configuración del servidor web
const tiendaRoutes = require('./routes/tienda.routes');
const {create}= require('./models/Tienda');


const app = express();

app.use(cors());

app.use('/api', tiendaRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// Habilitamos el puerto 
const port = process.env.PORT || 4000;
 const server= app.listen(port, () => {
  console.log('Servidor escuchando en el puerto: ' + port);
});

// Manejo de error 404
app.use((req, res, next) => {
  next(createError(404))
});

// Manejo de error general
app.use(function(err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});
