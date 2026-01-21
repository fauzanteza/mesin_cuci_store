const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const OrderItem = require('../models/OrderItem');
const InventoryTransaction = require('../models/InventoryTransaction');

class ReportService {
    /**
     * Generate Sales Report (Excel)
     */
    static async generateSalesReport(filters) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Headers
        worksheet.columns = [
            { header: 'Order No', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Customer', key: 'customer', width: 25 },
            { header: 'Items', key: 'items', width: 40 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment', key: 'payment', width: 15 }
        ];

        // Data fetching
        const { startDate, endDate } = filters;
        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            include: [
                { model: User, attributes: ['name'] },
                { model: OrderItem, as: 'items', attributes: ['productName', 'quantity'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Add rows
        orders.forEach(order => {
            const itemsStr = order.items
                .map(i => `${i.productName} (${i.quantity})`)
                .join(', ');

            worksheet.addRow({
                orderNumber: order.orderNumber,
                date: order.createdAt.toISOString().split('T')[0],
                customer: order.User ? order.User.name : 'Guest',
                items: itemsStr,
                amount: order.totalAmount,
                status: order.status,
                payment: order.paymentStatus
            });
        });

        // Styling
        worksheet.getRow(1).font = { bold: true };
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        return workbook;
    }

    /**
     * Generate Inventory Report (PDF)
     */
    static async generateInventoryReportPDF() {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const buffers = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // Header
                doc.font('Helvetica-Bold').fontSize(20).text('Inventory Report', { align: 'center' });
                doc.moveDown();
                doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
                doc.moveDown(2);

                // Fetch Data
                const products = await Product.findAll({
                    where: { isActive: true },
                    order: [['stock', 'ASC']]
                });

                // Table Header
                const startX = 50;
                let currentY = doc.y;

                doc.font('Helvetica-Bold');
                doc.text('SKU', startX, currentY);
                doc.text('Product Name', startX + 80, currentY);
                doc.text('Stock', startX + 300, currentY);
                doc.text('Status', startX + 380, currentY);
                doc.text('Price', startX + 460, currentY);

                doc.moveTo(startX, currentY + 15).lineTo(550, currentY + 15).stroke();
                currentY += 25;
                doc.font('Helvetica');

                // Table Rows
                products.forEach(product => {
                    if (currentY > 700) { // New page if near bottom
                        doc.addPage();
                        currentY = 50;
                        // Redraw header
                        doc.font('Helvetica-Bold');
                        doc.text('SKU', startX, currentY);
                        doc.text('Product Name', startX + 80, currentY);
                        doc.text('Stock', startX + 300, currentY);
                        doc.text('Status', startX + 380, currentY);
                        doc.text('Price', startX + 460, currentY);
                        doc.moveTo(startX, currentY + 15).lineTo(550, currentY + 15).stroke();
                        currentY += 25;
                        doc.font('Helvetica');
                    }

                    let stockStatus = 'In Stock';
                    let statusColor = 'black';

                    if (product.stock === 0) {
                        stockStatus = 'Out of Stock';
                        statusColor = 'red';
                    } else if (product.stock <= product.lowStockThreshold) {
                        stockStatus = 'Low Stock';
                        statusColor = 'orange';
                    }

                    doc.fillColor('black').text(product.sku, startX, currentY);
                    // Truncate long names
                    let name = product.name;
                    if (name.length > 35) name = name.substring(0, 32) + '...';

                    doc.text(name, startX + 80, currentY);

                    doc.text(product.stock.toString(), startX + 300, currentY);

                    doc.fillColor(statusColor).text(stockStatus, startX + 380, currentY);

                    doc.fillColor('black').text(
                        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })
                            .format(product.price),
                        startX + 460,
                        currentY
                    );

                    currentY += 20;
                });

                // Summary Statistics
                doc.addPage();
                doc.font('Helvetica-Bold').fontSize(16).text('Inventory Summary', { align: 'center' });
                doc.moveDown();

                const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
                const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
                const outStockCount = products.filter(p => p.stock === 0).length;
                const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

                doc.fontSize(12).font('Helvetica');
                doc.text(`Total Items in Stock: ${totalItems}`);
                doc.moveDown(0.5);
                doc.text(`Low Stock Products: ${lowStockCount}`);
                doc.moveDown(0.5);
                doc.text(`Out of Stock Products: ${outStockCount}`);
                doc.moveDown(0.5);
                doc.text(`Total Inventory Value: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalValue)}`);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Generate Customer Report (Excel)
     */
    static async generateCustomerReport() {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Customer Report');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Joined Date', key: 'joined', width: 15 },
            { header: 'Total Orders', key: 'orders', width: 15 },
            { header: 'Total Spent', key: 'spent', width: 20 },
            { header: 'Last Login', key: 'lastLogin', width: 20 }
        ];

        const users = await User.findAll({
            where: { role: 'user' },
            attributes: ['id', 'name', 'email', 'createdAt', 'lastLogin'],
            include: [{
                model: Order,
                attributes: ['totalAmount'],
                where: { status: 'delivered' },
                required: false
            }]
        });

        users.forEach(user => {
            const totalOrders = user.Orders ? user.Orders.length : 0;
            const totalSpent = user.Orders
                ? user.Orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0)
                : 0;

            worksheet.addRow({
                name: user.name,
                email: user.email,
                joined: user.createdAt.toISOString().split('T')[0],
                orders: totalOrders,
                spent: totalSpent,
                lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : 'Never'
            });
        });

        return workbook;
    }
}

module.exports = ReportService;
