const multer = require('multer');
const { storage } = require('../config/cloudinary');

// Init upload instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
});

module.exports = upload;

