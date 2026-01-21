import sequelize from '../config/database.js';
import User from './User.js';
import Address from './Address.js';
import Category from './Category.js';
import Brand from './Brand.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';
import ProductVariant from './ProductVariant.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import OrderStatusHistory from './OrderStatusHistory.js';
import Payment from './Payment.js';
import CartItem from './CartItem.js';
import WishlistItem from './WishlistItem.js';
import Review from './Review.js';
import ReviewVote from './ReviewVote.js';
import PromoCode from './PromoCode.js';
import Notification from './Notification.js';
import AuditLog from './AuditLog.js';
import ProductComparison from './ProductComparison.js';
import ProductView from './ProductView.js';
import AbandonedCart from './AbandonedCart.js';
import SiteSetting from './SiteSetting.js';
import Banner from './Banner.js';
import ReturnRequest from './ReturnRequest.js';
import InventoryTransaction from './InventoryTransaction.js';
import TokenBlacklist from './TokenBlacklist.js';

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
  User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems' });
  User.hasMany(WishlistItem, { foreignKey: 'user_id', as: 'wishlistItems' });
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
  User.hasMany(ProductComparison, { foreignKey: 'user_id', as: 'productComparisons' });
  User.hasMany(ProductView, { foreignKey: 'user_id', as: 'productViews' });
  User.hasMany(AbandonedCart, { foreignKey: 'user_id', as: 'abandonedCarts' });
  User.hasMany(InventoryTransaction, { foreignKey: 'created_by', as: 'inventoryTransactions' });

  Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  CartItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  WishlistItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  ProductComparison.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  ProductView.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  AbandonedCart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  InventoryTransaction.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

  // Category associations
  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // Brand associations
  Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
  Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

  // Product associations
  Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
  Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
  Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
  Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
  Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
  Product.hasMany(WishlistItem, { foreignKey: 'product_id', as: 'wishlistItems' });
  Product.hasMany(InventoryTransaction, { foreignKey: 'product_id', as: 'inventoryTransactions' });

  ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  WishlistItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  InventoryTransaction.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Order associations
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });
  Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
  Order.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });

  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
  OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  // Review associations
  Review.hasMany(ReviewVote, { foreignKey: 'review_id', as: 'votes' });
  Review.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });

  ReviewVote.belongsTo(Review, { foreignKey: 'review_id', as: 'review' });
  ReviewVote.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Cart associations
  CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  // Indexes
  // sequelize.query(`
  // CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  // CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  // CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  // CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
  // CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
  // `).catch(err => console.log('Index creation warning:', err.message));
};

// Initialize associations
defineAssociations();

// Export models
const models = {
  sequelize,
  User,
  Address,
  Category,
  Brand,
  Product,
  ProductImage,
  ProductVariant,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  CartItem,
  WishlistItem,
  Review,
  ReviewVote,
  PromoCode,
  Notification,
  AuditLog,
  ProductComparison,
  ProductView,
  AbandonedCart,
  SiteSetting,
  Banner,
  ReturnRequest,
  InventoryTransaction,
  TokenBlacklist,

};

export default models;
