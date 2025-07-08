const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'CLOUDINARY_CLOUD_NAME',
  api_key: 'CLOUDINARY_API_KEY',
  api_secret: 'CLOUDINARY_API_SECRET'
});
