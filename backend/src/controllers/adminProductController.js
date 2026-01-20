import adminProductService from '../services/adminProduct.service.js';
// import { uploadToCloudinary } from '../utils/uploadFile.js'; // Not used, using local storage

class AdminProductController {
    // GET /api/admin/products
    async getProducts(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                category,
                brand,
                status,
                minPrice,
                maxPrice,
                sortBy = 'createdAt',
                sortOrder = 'DESC'
            } = req.query;

            const products = await adminProductService.getProducts({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                category,
                brand,
                status,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                sortBy,
                sortOrder: sortOrder.toUpperCase()
            });

            res.json({
                success: true,
                data: products.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: products.count,
                    totalPages: Math.ceil(products.count / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/products/:id
    async getProduct(req, res, next) {
        try {
            const product = await adminProductService.getProductById(req.params.id);
            res.json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/products
    async createProduct(req, res, next) {
        try {
            const productData = req.body;

            // Handle image uploads if any
            // Handle image uploads
            const images = [];
            if (req.files && req.files.images) {
                // Use local upload
                req.files.images.forEach((file, index) => {
                    const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
                    images.push({
                        url: url,
                        publicId: file.filename, // Use filename as publicId for local
                        isPrimary: index === 0
                    });
                });
            }

            const product = await adminProductService.createProduct(productData, images);
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/admin/products/:id
    async updateProduct(req, res, next) {
        try {
            const newImages = [];
            if (req.files && req.files.newImages) {
                req.files.newImages.forEach((file) => {
                    const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
                    newImages.push({
                        secure_url: url,
                        public_id: file.filename
                    });
                });
            }

            const product = await adminProductService.updateProduct(
                req.params.id,
                req.body,
                newImages
            );
            res.json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/admin/products/:id
    async deleteProduct(req, res, next) {
        try {
            await adminProductService.deleteProduct(req.params.id);
            res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/products/:id/status
    async updateProductStatus(req, res, next) {
        try {
            const { status } = req.body;
            const product = await adminProductService.updateProductStatus(
                req.params.id,
                status
            );
            res.json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/products/:id/stock
    async updateProductStock(req, res, next) {
        try {
            const { stock, operation = 'set' } = req.body;
            const product = await adminProductService.updateProductStock(
                req.params.id,
                stock,
                operation
            );
            res.json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/products/bulk
    async bulkUpdateProducts(req, res, next) {
        try {
            const { productIds, action, data } = req.body;
            const result = await adminProductService.bulkUpdateProducts(
                productIds,
                action,
                data
            );
            res.json({
                success: true,
                message: `${result.updatedCount} products updated`
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/products/export
    async exportProducts(req, res, next) {
        try {
            const { format = 'csv' } = req.query;
            const fileBuffer = await adminProductService.exportProducts(format);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
            res.send(fileBuffer);
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/products/import
    async importProducts(req, res, next) {
        try {
            if (!req.file) {
                throw new Error('No file uploaded');
            }

            const result = await adminProductService.importProducts(req.file);
            res.json({
                success: true,
                message: `Imported ${result.created} products, updated ${result.updated}, failed ${result.failed}`
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminProductController();
