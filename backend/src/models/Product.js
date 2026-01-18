import { DataTypes, Op } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [3, 200],
        },
    },
    slug: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        },
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    short_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    compare_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    cost: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            isInt: true,
            min: 0,
        },
    },
    low_stock_threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        validate: {
            isInt: true,
            min: 0,
        },
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
        validate: {
            isDecimal: true,
            min: 0,
            max: 5,
        },
    },
    review_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            isInt: true,
            min: 0,
        },
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id',
        },
    },
    brand_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'brands',
            key: 'id',
        },
    },
    specifications: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    features: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    warranty_months: {
        type: DataTypes.INTEGER,
        defaultValue: 12,
        validate: {
            isInt: true,
            min: 0,
        },
    },
    weight_kg: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        validate: {
            isDecimal: true,
            min: 0,
        },
    },
    dimensions: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    seo_title: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    seo_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    seo_keywords: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },
    views_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    sales_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    defaultScope: {
        attributes: {
            exclude: ['deleted_at'],
        },
    },
    scopes: {
        available: {
            where: {
                is_available: true,
                stock: { [Op.gt]: 0 },
            },
        },
        featured: {
            where: {
                is_featured: true,
                is_available: true,
            },
        },
        withDetails: {
            include: ['category', 'brand', 'images'],
        },
    },
});

// Instance methods
Product.prototype.isLowStock = function () {
    return this.stock <= this.low_stock_threshold;
};

Product.prototype.getDiscountPercentage = function () {
    if (!this.compare_price || this.compare_price <= this.price) {
        return 0;
    }
    return Math.round(((this.compare_price - this.price) / this.compare_price) * 100);
};

Product.prototype.decreaseStock = async function (quantity) {
    if (this.stock < quantity) {
        throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
    await this.save();
    return this;
};

Product.prototype.increaseStock = async function (quantity) {
    this.stock += quantity;
    await this.save();
    return this;
};

export default Product;
