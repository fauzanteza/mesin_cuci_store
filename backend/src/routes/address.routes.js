const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const authMiddleware = require('../middleware/auth');
// const validate = require('../middleware/validation');
// const { addressSchema } = require('../validators/schemas');

router.use(authMiddleware.protect);

router.get('/', addressController.getUserAddresses);
router.get('/:id', addressController.getAddress);
router.post('/', addressController.createAddress); // Add validation later
router.put('/:id', addressController.updateAddress); // Add validation later
router.delete('/:id', addressController.deleteAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;
