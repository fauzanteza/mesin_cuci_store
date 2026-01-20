const addressService = require('../services/address.service');

class AddressController {
    async getUserAddresses(req, res, next) {
        try {
            const addresses = await addressService.getUserAddresses(req.user.id);
            res.json({ success: true, data: addresses });
        } catch (error) {
            next(error);
        }
    }

    async getAddress(req, res, next) {
        try {
            const address = await addressService.getAddressById(
                req.params.id,
                req.user.id
            );
            res.json({ success: true, data: address });
        } catch (error) {
            next(error);
        }
    }

    async createAddress(req, res, next) {
        try {
            const address = await addressService.createAddress(
                req.body,
                req.user.id
            );
            res.status(201).json({ success: true, data: address });
        } catch (error) {
            next(error);
        }
    }

    async updateAddress(req, res, next) {
        try {
            const address = await addressService.updateAddress(
                req.params.id,
                req.body,
                req.user.id
            );
            res.json({ success: true, data: address });
        } catch (error) {
            next(error);
        }
    }

    async deleteAddress(req, res, next) {
        try {
            await addressService.deleteAddress(req.params.id, req.user.id);
            res.json({ success: true, message: 'Address deleted' });
        } catch (error) {
            next(error);
        }
    }

    async setDefaultAddress(req, res, next) {
        try {
            const address = await addressService.setDefaultAddress(
                req.params.id,
                req.user.id
            );
            res.json({ success: true, data: address });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AddressController();
