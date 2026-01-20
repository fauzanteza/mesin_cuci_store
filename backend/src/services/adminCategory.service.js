import Sequelize, { Op } from 'sequelize';
import models from '../models/index.js';
import { uploadToCloudinary } from '../utils/uploadFile.js';

const { Category, Product, sequelize } = models;

class AdminCategoryService {
    async getCategories({
        page,
        limit,
        search,
        parentId,
        status,
        featured,
        sortBy,
        sortOrder
    }) {
        const offset = (page - 1) * limit;

        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { slug: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        if (parentId !== undefined && parentId !== null) {
            where.parentId = parentId === 'null' ? null : parentId;
        }

        if (status !== undefined) {
            where.isActive = status;
        }

        if (featured !== undefined) {
            where.isFeatured = featured;
        }

        // Get product counts
        const include = [{
            model: Product,
            as: 'products',
            attributes: [],
            required: false
        }];

        const attributes = [
            'id', 'name', 'slug', 'description', 'parentId',
            'image', 'icon', 'sortOrder', 'isActive', 'isFeatured',
            'createdAt', 'updatedAt',
            [Sequelize.fn('COUNT', Sequelize.col('products.id')), 'productCount']
        ];

        const order = [];
        if (sortBy === 'name') {
            order.push(['name', sortOrder]);
        } else if (sortBy === 'productCount') {
            order.push([Sequelize.literal('productCount'), sortOrder]);
        } else if (sortBy === 'createdAt') {
            order.push(['createdAt', sortOrder]);
        } else {
            order.push(['sortOrder', sortOrder]);
        }

        const { rows, count } = await Category.findAndCountAll({
            where,
            include,
            attributes,
            group: ['Category.id'],
            order,
            limit,
            offset,
            subQuery: false
        });

        // Get parent names
        const categoriesWithParents = await Promise.all(
            rows.map(async (category) => {
                const data = category.get({ plain: true });

                if (data.parentId) {
                    const parent = await Category.findByPk(data.parentId, {
                        attributes: ['name']
                    });
                    data.parentName = parent?.name;
                }

                return data;
            })
        );

        // Count is returned as array of objects due to group by, we need total count
        // This is a known sequalize behavior with group
        // For simple count, we might want a separate query without group/include if performance matters
        // But for now, let's use the length of the result as 'count' if paginated correctly this is not 'total'
        // To get total count with group by, we often need a separate count query.
        // However, findAndCountAll with group usually returns count as array.
        const totalCount = count.length || count; // Verify this behavior

        return { rows: categoriesWithParents, count: Array.isArray(count) ? count.length : count };
    }

    async getCategoryTree(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };

        const categories = await Category.findAll({
            where,
            order: [['sortOrder', 'ASC']],
            raw: true
        });

        // Build tree structure
        const categoryMap = new Map();
        const tree = [];

        // Initialize map
        categories.forEach(category => {
            categoryMap.set(category.id, {
                ...category,
                children: []
            });
        });

        // Build hierarchy
        categories.forEach(category => {
            const node = categoryMap.get(category.id);

            if (category.parentId && categoryMap.has(category.parentId)) {
                const parent = categoryMap.get(category.parentId);
                parent.children.push(node);
            } else {
                tree.push(node);
            }
        });

        return tree;
    }

    async getCategoryById(id) {
        const category = await Category.findByPk(id, {
            include: [{
                model: Category,
                as: 'parent',
                attributes: ['id', 'name', 'slug']
            }, {
                model: Category,
                as: 'children',
                attributes: ['id', 'name', 'slug', 'productCount'],
                where: { isActive: true },
                required: false
            }, {
                model: Product,
                as: 'products',
                attributes: ['id', 'name', 'price', 'stock', 'status'],
                limit: 10,
                required: false
            }]
        });

        if (!category) {
            throw new Error('Category not found');
        }

        // Get product count
        const productCount = await Product.count({
            where: { categoryId: id }
        });

        const data = category.get({ plain: true });
        data.productCount = productCount;

        return data;
    }

    async createCategory(categoryData) {
        const transaction = await sequelize.transaction();

        try {
            // Generate slug if not provided
            if (!categoryData.slug) {
                categoryData.slug = this.generateSlug(categoryData.name);
            }

            // Validate slug uniqueness
            const existing = await Category.findOne({
                where: { slug: categoryData.slug },
                transaction
            });

            if (existing) {
                throw new Error('Slug already exists');
            }

            // Set sort order if not provided
            if (categoryData.sortOrder === undefined) {
                const maxOrder = await Category.max('sortOrder', {
                    where: { parentId: categoryData.parentId || null },
                    transaction
                });
                categoryData.sortOrder = (maxOrder || 0) + 1;
            }

            const category = await Category.create(categoryData, { transaction });
            await transaction.commit();

            return await this.getCategoryById(category.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateCategory(id, updateData) {
        const transaction = await sequelize.transaction();

        try {
            const category = await Category.findByPk(id, { transaction });

            if (!category) {
                throw new Error('Category not found');
            }

            // Check if trying to set parent to itself or descendant
            if (updateData.parentId && updateData.parentId !== category.parentId) {
                if (updateData.parentId === id) {
                    throw new Error('Category cannot be its own parent');
                }

                // Check for circular reference
                const isDescendant = await this.isDescendant(id, updateData.parentId);
                if (isDescendant) {
                    throw new Error('Cannot set parent to a descendant category');
                }
            }

            // Update slug if name changed
            if (updateData.name && updateData.name !== category.name) {
                if (!updateData.slug) {
                    updateData.slug = this.generateSlug(updateData.name);
                }

                // Check slug uniqueness
                const existing = await Category.findOne({
                    where: {
                        slug: updateData.slug,
                        id: { [Op.ne]: id }
                    },
                    transaction
                });

                if (existing) {
                    throw new Error('Slug already exists');
                }
            }

            await category.update(updateData, { transaction });
            await transaction.commit();

            return await this.getCategoryById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async deleteCategory(id) {
        const transaction = await sequelize.transaction();

        try {
            const category = await Category.findByPk(id, { transaction });

            if (!category) {
                throw new Error('Category not found');
            }

            // Check if category has products
            const productCount = await Product.count({
                where: { categoryId: id },
                transaction
            });

            if (productCount > 0) {
                throw new Error(`Category has ${productCount} products. Move or delete products first.`);
            }

            // Check if category has children
            const childCount = await Category.count({
                where: { parentId: id },
                transaction
            });

            if (childCount > 0) {
                throw new Error(`Category has ${childCount} sub-categories. Delete sub-categories first.`);
            }

            // Delete category
            await category.destroy({ transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateCategoryStatus(id, isActive) {
        const transaction = await sequelize.transaction();

        try {
            const category = await Category.findByPk(id, { transaction });

            if (!category) {
                throw new Error('Category not found');
            }

            await category.update({ isActive }, { transaction });

            // If deactivating, also deactivate all descendants
            if (!isActive) {
                await this.deactivateDescendants(id, transaction);
            }

            await transaction.commit();
            return await this.getCategoryById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateCategoryFeatured(id, isFeatured) {
        const category = await Category.findByPk(id);

        if (!category) {
            throw new Error('Category not found');
        }

        await category.update({ isFeatured });
        return category;
    }

    async reorderCategories(categories) {
        const transaction = await sequelize.transaction();

        try {
            for (const item of categories) {
                await Category.update(
                    { sortOrder: item.sortOrder },
                    {
                        where: { id: item.id },
                        transaction
                    }
                );
            }

            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async bulkUpdateCategories(categoryIds, action, data) {
        const where = { id: { [Op.in]: categoryIds } };

        let updateData = {};

        switch (action) {
            case 'activate':
                updateData.isActive = true;
                break;
            case 'deactivate':
                updateData.isActive = false;
                break;
            case 'feature':
                updateData.isFeatured = true;
                break;
            case 'unfeature':
                updateData.isFeatured = false;
                break;
            case 'move':
                if (data.parentId !== undefined) {
                    updateData.parentId = data.parentId;
                }
                break;
            default:
                throw new Error('Invalid bulk action');
        }

        const [updatedCount] = await Category.update(updateData, { where });

        return { updatedCount };
    }

    async getCategoryStats() {
        const totalCategories = await Category.count();
        const activeCategories = await Category.count({ where: { isActive: true } });
        const featuredCategories = await Category.count({ where: { isFeatured: true } });
        const topLevelCategories = await Category.count({ where: { parentId: null } });

        // Get categories with most products
        const topCategories = await Category.findAll({
            attributes: [
                'id', 'name',
                [Sequelize.fn('COUNT', Sequelize.col('products.id')), 'productCount']
            ],
            include: [{
                model: Product,
                as: 'products',
                attributes: [],
                required: false
            }],
            group: ['Category.id'],
            order: [[Sequelize.literal('productCount'), 'DESC']],
            limit: 5
        });

        return {
            totalCategories,
            activeCategories,
            featuredCategories,
            topLevelCategories,
            topCategories: topCategories.map(cat => cat.get({ plain: true }))
        };
    }

    async uploadCategoryImage(id, file) {
        const category = await Category.findByPk(id);

        if (!category) {
            throw new Error('Category not found');
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file, 'categories');

        // Update category with image URL
        await category.update({
            image: result.secure_url,
            // imagePublicId: result.public_id // Assuming model has this field, remove if not
        });

        return category;
    }

    // Helper methods
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    async isDescendant(parentId, childId) {
        const getChildrenIds = async (categoryId) => {
            const children = await Category.findAll({
                where: { parentId: categoryId },
                attributes: ['id'],
                raw: true
            });

            const ids = children.map(c => c.id);

            for (const id of ids) {
                const grandchildren = await getChildrenIds(id);
                ids.push(...grandchildren);
            }

            return ids;
        };

        const descendantIds = await getChildrenIds(parentId);
        return descendantIds.includes(childId);
    }

    async deactivateDescendants(parentId, transaction) {
        const children = await Category.findAll({
            where: { parentId },
            transaction
        });

        for (const child of children) {
            await child.update({ isActive: false }, { transaction });
            await this.deactivateDescendants(child.id, transaction);
        }
    }
}

export default new AdminCategoryService();
