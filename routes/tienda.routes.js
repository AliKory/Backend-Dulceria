const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Modelo Tienda
let Tienda = require('../models/Tienda');

// Multer configuración (memoria para pasar el buffer a Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Agregar un nuevo producto
router.route('/agregar').post(upload.single('imagen'), async (req, res) => {
    try {
        let imagenURL = '';

        // Si hay imagen, subirla a Cloudinary
        if (req.file) {
            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream((error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const result = await streamUpload(req);
            imagenURL = result.secure_url;
        }

        // Crear producto
        const nuevoProducto = {
            nombre: req.body.nombre,
            precio: req.body.precio,
            caducidad: req.body.caducidad,
            cantidad: req.body.cantidad,
            tipo: req.body.tipo,
            imagen: imagenURL
        };

        const productoCreado = await Tienda.create(nuevoProducto);
        console.log('Producto agregado correctamente');
        res.send(productoCreado);
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al agregar producto');
    }
});

// Obtener todos los productos
router.route('/productos').get((req, res) => {
    Tienda.find()
        .then((data) => res.send(data))
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error al obtener productos');
        });
});

// Obtener un solo producto por su ID
router.route('/producto/:id').get((req, res) => {
    Tienda.findById(req.params.id)
        .then((data) => res.send(data))
        .catch((error) => {
            console.log(error);
            res.status(500).send('Error al obtener producto');
        });
});

// Actualizar producto
router.route('/actualizar/:id').put((req, res) => {
    Tienda.findByIdAndUpdate(req.params.id, {
        $set: req.body
    })
    .then((data) => {
        console.log('Producto actualizado correctamente');
        res.send(data);
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('Error al actualizar producto');
    });
});

// Eliminar producto
router.route('/eliminar/:id').delete((req, res) => {
    Tienda.findByIdAndDelete(req.params.id)
    .then((data) => {
        console.log('Producto eliminado correctamente');
        res.send(data);
    })
    .catch((error) => {
        console.log(error);
        res.status(500).send('Error al eliminar producto');
    });
});

module.exports = router;
