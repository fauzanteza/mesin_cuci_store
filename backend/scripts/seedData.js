import models from '../src/models/index.js';
import { connectDB } from '../src/config/database.js';
import logger from '../src/utils/logger.js';

const { Category, Product, User } = models;

const seedData = async () => {
    try {
        await connectDB();
        logger.info('🌱 Starting database seeding...');

        // 1. Create Categories
        const categories = await Category.bulkCreate([
            {
                name: 'Front Load',
                slug: 'front-load',
                description: 'Mesin cuci bukaan depan yang hemat air dan energi.',
                image: 'https://placehold.co/400x400?text=Front+Load'
            },
            {
                name: 'Top Load',
                slug: 'top-load',
                description: 'Mesin cuci bukaan atas yang praktis dan mudah digunakan.',
                image: 'https://placehold.co/400x400?text=Top+Load'
            },
            {
                name: '2 Tabung',
                slug: '2-tabung',
                description: 'Mesin cuci 2 tabung dengan harga ekonomis.',
                image: 'https://placehold.co/400x400?text=2+Tabung'
            },
            {
                name: 'Dryer',
                slug: 'dryer',
                description: 'Mesin pengering pakaian untuk hasil cepat kering.',
                image: 'https://placehold.co/400x400?text=Dryer'
            }
        ], { ignoreDuplicates: true });

        logger.info(`✅ Created ${categories.length} categories`);

        // 2. Create Products
        // Need to get IDs first if we want to associate correctly, but we can assume IDs 1-4
        // Or fetch them back.
        const frontLoadCat = await Category.findOne({ where: { slug: 'front-load' } });
        const topLoadCat = await Category.findOne({ where: { slug: 'top-load' } });

        const products = await Product.bulkCreate([
            {
                name: 'Samsung AI Ecobubble 11kg',
                slug: 'samsung-ai-ecobubble-11kg',
                description: 'Mesin cuci pintar dengan teknologi AI Ecobubble yang melindungi pakaian.',
                price: 8500000,
                stock: 15,
                categoryId: frontLoadCat?.id || 1,
                images: JSON.stringify(['https://placehold.co/600x600?text=Samsung+AI']),
                featured: true
            },
            {
                name: 'LG Front Load 8kg',
                slug: 'lg-front-load-8kg',
                description: 'Desain ramping dengan performa pencucian maksimal.',
                price: 5200000,
                stock: 20,
                categoryId: frontLoadCat?.id || 1,
                images: JSON.stringify(['https://placehold.co/600x600?text=LG+Front']),
                featured: true
            },
            {
                name: 'Sharp Top Load 9kg',
                slug: 'sharp-top-load-9kg',
                description: 'Pencucian kuat untuk noda membandel.',
                price: 3100000,
                stock: 5,
                categoryId: topLoadCat?.id || 2,
                images: JSON.stringify(['https://placehold.co/600x600?text=Sharp+Top']),
                featured: false
            },
            {
                name: 'Electrolux UltimateCare 500',
                slug: 'electrolux-ultimatecare-500',
                description: 'Perlindungan warna hingga 40% lebih baik.',
                price: 7800000,
                stock: 8,
                categoryId: frontLoadCat?.id || 1,
                images: JSON.stringify(['https://placehold.co/600x600?text=Electrolux']),
                featured: true
            }
        ], { ignoreDuplicates: true });

        logger.info(`✅ Created ${products.length} products`);

        logger.info('✨ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
