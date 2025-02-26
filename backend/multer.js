const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configurare Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Numele cloud-ului tău de pe Cloudinary
    api_key: process.env.CLOUDINARY_API_KEY,       // Cheia API de pe Cloudinary
    api_secret: process.env.CLOUDINARY_API_SECRET, // Secretul API de pe Cloudinary
});

// Configurare stocare Cloudinary pentru multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads', // Folderul în care vor fi stocate fișierele pe Cloudinary
        format: async (req, file) => file.mimetype.split('/')[1],
        public_id: (req, file) => {
            // Generează un nume unic pentru fișier folosind timestamp
            return `file-${Date.now()}`;
        },
    },
});

// File filter pentru a accepta doar imagini
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
};

// Inițializează multer cu stocarea Cloudinary și filtrul de fișiere
const upload = multer({ storage, fileFilter });

module.exports = upload;


// const multer = require('multer');
// const path = require('path');
//
// // Storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/'); // destination folder for storing files
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
//     },
// });
//
// // File filter to accept only images
// const fileFilter = (req, file, cb) => {
//     if(file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Invalid file type'));
//     }
// };
//
// // Initialize multer instance
// const upload = multer({storage, fileFilter});
//
// module.exports = upload;
