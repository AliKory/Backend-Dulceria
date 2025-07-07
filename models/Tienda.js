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
    caducidad:{
        type: Date,
    },
    cantidad: {
        type: Number,
    },
    imagen: {
        type: String,
    },
}, {
    collection: 'tienda'  
})

module.exports = mongoose.model('Tienda', Tienda);
