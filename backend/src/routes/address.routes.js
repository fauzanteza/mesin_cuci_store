import express from 'express';
import addressController from '../controllers/addressController.js';
import { protect } from '../middleware/auth.js';
// import validate from '../middleware/validation.js';
// import { addressSchema } from '../validators/schemas.js';

const router = express.Router();

router.use(protect);

router.get('/', addressController.getUserAddresses);
router.get('/:id', addressController.getAddress);
router.post('/', addressController.createAddress); // Add validation later
router.put('/:id', addressController.updateAddress); // Add validation later
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

export default router;
