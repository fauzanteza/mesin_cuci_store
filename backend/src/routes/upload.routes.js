import express from 'express';
import * as uploadController from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js'; // Assumes middleware exists or will be created

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadController.uploadFile);

export default router;
