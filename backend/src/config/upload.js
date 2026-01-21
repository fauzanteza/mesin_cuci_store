import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/temp/';

        // Set destination based on file type
        if (file.fieldname === 'productImages') {
            uploadPath = 'uploads/products/images/';
        } else if (file.fieldname === 'avatar') {
            uploadPath = 'uploads/users/avatars/';
        } else if (file.fieldname === 'paymentProof') {
            uploadPath = 'uploads/payments/proofs/';
        } else if (file.fieldname === 'banner') {
            uploadPath = 'uploads/banners/';
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (jpeg, jpg, png, gif, webp) dan PDF yang diperbolehkan'));
    }
};

// Limits
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10 // Max 10 files per upload
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits
});

// Custom upload middleware for different types
export const uploadProductImages = upload.array('productImages', 10);
export const uploadAvatar = upload.single('avatar');
export const uploadPaymentProof = upload.single('paymentProof');
export const uploadBanner = upload.single('banner');

export default {
    upload,
    uploadProductImages,
    uploadAvatar,
    uploadPaymentProof,
    uploadBanner
};
