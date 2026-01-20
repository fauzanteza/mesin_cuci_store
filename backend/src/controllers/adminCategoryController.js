import adminCategoryService from '../services/adminCategory.service.js';

class AdminCategoryController {
    // GET /api/admin/categories
    async getCategories(req, res, next) {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                parentId,
                status,
                featured,
                sortBy = 'sortOrder',
                sortOrder = 'ASC'
            } = req.query;

            const categories = await adminCategoryService.getCategories({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                parentId: parentId || null,
                status: status === 'true' ? true : status === 'false' ? false : undefined,
                featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
                sortBy,
                sortOrder: sortOrder.toUpperCase()
            });

            res.json({
                success: true,
                data: categories.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: categories.count,
                    totalPages: Math.ceil(categories.count / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/categories/tree
    async getCategoryTree(req, res, next) {
        try {
            const { includeInactive = false } = req.query;
            const tree = await adminCategoryService.getCategoryTree(includeInactive === 'true');
            res.json({ success: true, data: tree });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/categories/:id
    async getCategory(req, res, next) {
        try {
            const category = await adminCategoryService.getCategoryById(req.params.id);
            res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/categories
    async createCategory(req, res, next) {
        try {
            const category = await adminCategoryService.createCategory(req.body);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    // PUT /api/admin/categories/:id
    async updateCategory(req, res, next) {
        try {
            const category = await adminCategoryService.updateCategory(
                req.params.id,
                req.body
            );
            res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /api/admin/categories/:id
    async deleteCategory(req, res, next) {
        try {
            await adminCategoryService.deleteCategory(req.params.id);
            res.json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/categories/:id/status
    async updateCategoryStatus(req, res, next) {
        try {
            const { isActive } = req.body;
            const category = await adminCategoryService.updateCategoryStatus(
                req.params.id,
                isActive
            );
            res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/categories/:id/featured
    async updateCategoryFeatured(req, res, next) {
        try {
            const { isFeatured } = req.body;
            const category = await adminCategoryService.updateCategoryFeatured(
                req.params.id,
                isFeatured
            );
            res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/categories/reorder
    async reorderCategories(req, res, next) {
        try {
            const { categories } = req.body; // Array of {id, sortOrder}
            await adminCategoryService.reorderCategories(categories);
            res.json({ success: true, message: 'Categories reordered successfully' });
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/admin/categories/bulk
    async bulkUpdateCategories(req, res, next) {
        try {
            const { categoryIds, action, data } = req.body;
            const result = await adminCategoryService.bulkUpdateCategories(
                categoryIds,
                action,
                data
            );
            res.json({
                success: true,
                message: `${result.updatedCount} categories updated`
            });
        } catch (error) {
            next(error);
        }
    }

    // GET /api/admin/categories/stats
    async getCategoryStats(req, res, next) {
        try {
            const stats = await adminCategoryService.getCategoryStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }

    // POST /api/admin/categories/:id/image
    async uploadCategoryImage(req, res, next) {
        try {
            if (!req.file) {
                throw new Error('No image file uploaded');
            }

            const category = await adminCategoryService.uploadCategoryImage(
                req.params.id,
                req.file
            );
            res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminCategoryController();
