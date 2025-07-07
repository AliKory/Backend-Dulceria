const express = require('express');
const router = express.Router();
const multer = require('multer');
const Tienda = require('../models/Tienda');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configurar Cloudinary con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar Multer para subir directamente a Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dulceria',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  }
});

const upload = multer({ storage });

// Agregar producto
router.post('/agregar', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, caducidad, cantidad, tipo } = req.body;

    const nuevaTienda = new Tienda({
      nombre,
      precio,
      caducidad,
      cantidad,
      tipo,
      imagen: req.file?.path  // URL de Cloudinary
    });

    const saved = await nuevaTienda.save();
    res.send(saved);
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).send(error);
  }
});

// Obtener todos los productos
router.get('/tiendas', async (req, res) => {
  try {
    const productos = await Tienda.find();
    res.send(productos);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Obtener producto por ID
router.get('/tienda/:id', async (req, res) => {
  try {
    const producto = await Tienda.findById(req.params.id);
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.send(producto);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Actualizar producto
router.put('/actualizar/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, caducidad, cantidad, tipo } = req.body;

    const updateData = {
      nombre,
      precio,
      caducidad,
      cantidad,
      tipo
    };

    if (req.file) {
      updateData.imagen = req.file.path; // URL de Cloudinary
    } else if (req.body.imagen) {
      updateData.imagen = req.body.imagen; // Ruta ya existente
    }

    const updated = await Tienda.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).send('Producto no encontrado para actualizar');

    res.send(updated);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Eliminar producto
router.delete('/eliminar/:id', async (req, res) => {
  try {
    const eliminado = await Tienda.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).send('Producto no encontrado para eliminar');
    res.send(eliminado);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
