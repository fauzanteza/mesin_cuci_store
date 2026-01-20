const { Address } = require('../models');

class AddressService {
    async getUserAddresses(userId) {
        return await Address.findAll({
            where: { userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
    }

    async getAddressById(id, userId) {
        const address = await Address.findOne({
            where: { id, userId }
        });

        if (!address) {
            throw new Error('Address not found');
        }

        return address;
    }

    async createAddress(data, userId) {
        // If setting as default, unset other defaults
        if (data.isDefault) {
            await Address.update(
                { isDefault: false },
                { where: { userId } }
            );
        }

        return await Address.create({
            ...data,
            userId
        });
    }

    async updateAddress(id, data, userId) {
        const address = await this.getAddressById(id, userId);

        // If setting as default, unset other defaults
        if (data.isDefault && !address.isDefault) {
            await Address.update(
                { isDefault: false },
                { where: { userId } }
            );
        }

        return await address.update(data);
    }

    async deleteAddress(id, userId) {
        const address = await this.getAddressById(id, userId);
        await address.destroy();

        // If deleted address was default, set another as default
        if (address.isDefault) {
            const nextAddress = await Address.findOne({
                where: { userId },
                order: [['createdAt', 'DESC']]
            });

            if (nextAddress) {
                await nextAddress.update({ isDefault: true });
            }
        }
    }

    async setDefaultAddress(id, userId) {
        // Unset all defaults
        await Address.update(
            { isDefault: false },
            { where: { userId } }
        );

        // Set new default
        const address = await this.getAddressById(id, userId);
        return await address.update({ isDefault: true });
    }
}

module.exports = new AddressService();
