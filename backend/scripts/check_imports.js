import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkImport(filePath) {
    try {
        await import(filePath);
        console.log(`✅ Success: ${filePath}`);
    } catch (error) {
        console.error(`❌ Failed: ${filePath}`);
        console.error(error);
    }
}

async function runChecks() {
    const routes = [
        '../src/routes/auth.routes.js',
        '../src/routes/user.routes.js',
        '../src/routes/product.routes.js',
        '../src/routes/category.routes.js',
        '../src/routes/order.routes.js',
        '../src/routes/cart.routes.js',
        '../src/routes/payment.routes.js',
        '../src/routes/review.routes.js',
        '../src/routes/admin.routes.js',
        '../src/routes/upload.routes.js'
    ];

    console.log('Checking route imports...');
    for (const route of routes) {
        await checkImport(route);
    }
}

runChecks();
