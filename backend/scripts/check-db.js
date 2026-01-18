const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function checkDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database.');

        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log(`Users count: ${users[0].count}`);

        const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
        console.log(`Products count: ${products[0].count}`);

        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables:', tables.map(t => Object.values(t)[0]).join(', '));

        await connection.end();
    } catch (error) {
        console.error('Error checking DB:', error.message);
    }
}

checkDb();
