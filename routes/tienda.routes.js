const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Declaramos un objeto de nuestro modelo
let Tienda = require('../models/Tienda');

// Configuración de almacenamiento con multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'Uploads/'); // crea esta carpeta si no existe
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // ejemplo: 1720300112312.png
  }
});

const upload = multer({ storage: storage });

// Agregar un nuevo producto a la tienda
router.post('/agregar', upload.single('imagen'), (req, res) => {
  const { nombre, precio, caducidad, cantidad, tipo } = req.body; // Cambia 'departamento' a 'tipo'

  const nuevaTienda = new Tienda({
    nombre,
    precio,
    caducidad,
    cantidad,
    tipo, // Usa 'tipo' en lugar de 'departamento'
    imagen: req.file ? req.file.path : undefined // No sobreescribas si no mandan nueva imagen
  });

  nuevaTienda.save()
    .then(data => {
      res.send(data);
    })
    .catch(error => {
      console.error(error);
      res.status(500).send(error);
    });
});

// Obtenemos todos los productos
router.route('/tiendas').get((req, res) => {
  Tienda.find()
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

// Obtenemos un solo producto por su ID
router.route('/tienda/:id').get((req, res) => {
  Tienda.findById(req.params.id)
    .then((data) => {
      if (!data) return res.status(404).send('Producto no encontrado');
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

// Actualizar un producto
router.route('/actualizar/:id').put(upload.single('imagen'), (req, res) => {
  const { nombre, precio, caducidad, cantidad, tipo } = req.body;

  const updateData = {
    nombre,
    precio,
    caducidad,
    cantidad,
    tipo,
    imagen: req.file ? req.file.path : req.body.imagen // Mantener la imagen existente si no se sube una nueva
  };

  Tienda.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true })
    .then((data) => {
      if (!data) return res.status(404).send('Producto no encontrado para actualizar');
      console.log('Se actualizó el producto correctamente');
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

// Eliminar un producto
router.route('/eliminar/:id').delete((req, res) => {
  Tienda.findByIdAndDelete(req.params.id)
    .then((data) => {
      if (!data) return res.status(404).send('Producto no encontrado para eliminar');
      console.log('Se eliminó el producto correctamente');
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send(error);
    });
});

module.exports = router;
