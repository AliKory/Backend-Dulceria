const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Tienda = new Schema({
    nombre: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
    },
    precio: {
        type: Number,
    },
    caducidad: {
        type: Date,
    },
    cantidad: {
        type: Number,
    },
    // Campos para imagen de Cloudinary
    imagenUrl: {
        type: String,
        default: null
    },
    imagenPublicId: {
        type: String,
        default: null
    },
    // Campo para imagen base64 (compatibilidad con método anterior)
    imagen: {
        type: String,
        default: null
    }
}, {
    collection: 'tienda',
    timestamps: true // Agregar createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Tienda', Tienda);