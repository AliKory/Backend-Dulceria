const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

// Modelo Tienda
let Tienda = require('../models/Tienda');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer configuración (memoria para pasar el buffer a Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============ RUTAS ACTUALIZADAS PARA COINCIDIR CON EL FRONTEND ============

// Obtener todos los productos - GET /api/tiendas
router.route('/tiendas').get((req, res) => {
    console.log('GET /api/tiendas - Obteniendo todos los productos');
    Tienda.find()
        .then((data) => {
            console.log(`Productos encontrados: ${data.length}`);
            res.json(data);
        })
        .catch((error) => {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ message: 'Error al obtener productos', error: error.message });
        });
});

// Obtener un solo producto por su ID - GET /api/tiendas/:id
router.route('/tiendas/:id').get((req, res) => {
    console.log(`GET /api/tiendas/${req.params.id} - Obteniendo producto específico`);
    Tienda.findById(req.params.id)
        .then((data) => {
            if (!data) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            res.json(data);
        })
        .catch((error) => {
            console.error('Error al obtener producto:', error);
            res.status(500).json({ message: 'Error al obtener producto', error: error.message });
        });
});

// Agregar un nuevo producto - POST /api/tiendas
router.route('/tiendas').post(upload.single('imagen'), async (req, res) => {
    try {
        console.log('POST /api/tiendas - Agregando nuevo producto');
        console.log('Datos recibidos:', req.body);
        console.log('Archivo recibido:', req.file ? 'Sí' : 'No');

        let imagenData = {};

        // Si hay imagen, subirla a Cloudinary
        if (req.file) {
            console.log('Subiendo imagen a Cloudinary...');
            const streamUpload = (req) => {
                return new Promise((resolve, reject) => {
                    let stream = cloudinary.uploader.upload_stream(
                        { 
                            folder: 'dulceria',
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };

            const result = await streamUpload(req);
            imagenData = {
                imagenUrl: result.secure_url,
                imagenPublicId: result.public_id
            };
            console.log('Imagen subida exitosamente:', result.secure_url);
        }

        // Si los datos vienen como JSON (desde Cloudinary en frontend)
        let datosProducto;
        if (req.body.imagenUrl) {
            // Datos ya procesados desde el frontend con Cloudinary
            datosProducto = {
                nombre: req.body.nombre,
                precio: parseFloat(req.body.precio),
                caducidad: new Date(req.body.caducidad),
                cantidad: parseInt(req.body.cantidad),
                tipo: req.body.tipo,
                imagenUrl: req.body.imagenUrl,
                imagenPublicId: req.body.imagenPublicId
            };
        } else {
            // Datos normales con posible imagen subida aquí
            datosProducto = {
                nombre: req.body.nombre,
                precio: parseFloat(req.body.precio),
                caducidad: new Date(req.body.caducidad),
                cantidad: parseInt(req.body.cantidad),
                tipo: req.body.tipo,
                ...imagenData
            };
        }

        console.log('Datos finales del producto:', datosProducto);

        const productoCreado = await Tienda.create(datosProducto);
        console.log('Producto agregado correctamente:', productoCreado._id);
        res.status(201).json(productoCreado);
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).json({ message: 'Error al agregar producto', error: error.message });
    }
});

// Actualizar producto - PUT /api/tiendas/:id
router.route('/tiendas/:id').put((req, res) => {
    console.log(`PUT /api/tiendas/${req.params.id} - Actualizando producto`);
    console.log('Datos de actualización:', req.body);

    const datosActualizacion = {
        nombre: req.body.nombre,
        precio: parseFloat(req.body.precio),
        caducidad: new Date(req.body.caducidad),
        cantidad: parseInt(req.body.cantidad),
        tipo: req.body.tipo
    };

    // Si hay datos de imagen, incluirlos
    if (req.body.imagenUrl) {
        datosActualizacion.imagenUrl = req.body.imagenUrl;
        datosActualizacion.imagenPublicId = req.body.imagenPublicId;
    }

    Tienda.findByIdAndUpdate(
        req.params.id, 
        { $set: datosActualizacion },
        { new: true } // Devolver el documento actualizado
    )
    .then((data) => {
        if (!data) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        console.log('Producto actualizado correctamente');
        res.json(data);
    })
    .catch((error) => {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    });
});

// Eliminar producto - DELETE /api/tiendas/:id
router.route('/tiendas/:id').delete(async (req, res) => {
    try {
        console.log(`DELETE /api/tiendas/${req.params.id} - Eliminando producto`);
        
        // Primero obtener el producto para ver si tiene imagen en Cloudinary
        const producto = await Tienda.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Si tiene imagen en Cloudinary, eliminarla
        if (producto.imagenPublicId) {
            try {
                await cloudinary.uploader.destroy(producto.imagenPublicId);
                console.log('Imagen eliminada de Cloudinary:', producto.imagenPublicId);
            } catch (cloudinaryError) {
                console.error('Error al eliminar imagen de Cloudinary:', cloudinaryError);
                // Continuar con la eliminación del producto aunque falle la imagen
            }
        }

        // Eliminar el producto de la base de datos
        const productoEliminado = await Tienda.findByIdAndDelete(req.params.id);
        console.log('Producto eliminado correctamente');
        res.json({ message: 'Producto eliminado correctamente', producto: productoEliminado });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
});

// ============ MANTENER RUTAS ANTERIORES PARA COMPATIBILIDAD (OPCIONAL) ============

// Rutas antiguas que redirigen a las nuevas
router.route('/productos').get((req, res) => {
    res.redirect('/api/tiendas');
});

router.route('/agregar').post((req, res) => {
    res.redirect(307, '/api/tiendas'); // 307 mantiene el método POST
});

module.exports = router;