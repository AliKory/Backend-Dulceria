const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de almacenamiento con Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tienda', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Opcional: redimensionar
  },
});

const upload = multer({ storage: storage });

let Tienda = require('../models/Tienda');

// Agregar un nuevo producto a la tienda
router.post('/agregar', upload.single('imagen'), (req, res) => {
  const { nombre, precio, caducidad, cantidad, tipo } = req.body;

  const nuevaTienda = new Tienda({
    nombre,
    precio,
    caducidad,
    cantidad,
    tipo,
    imagen: req.file ? req.file.path : undefined // URL de Cloudinary
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

// Actualizar un producto
router.route('/actualizar/:id').put(upload.single('imagen'), (req, res) => {
  const { nombre, precio, caducidad, cantidad, tipo } = req.body;

  const updateData = {
    nombre,
    precio,
    caducidad,
    cantidad,
    tipo,
    imagen: req.file ? req.file.path : req.body.imagen
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

// Resto de tus rutas...
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