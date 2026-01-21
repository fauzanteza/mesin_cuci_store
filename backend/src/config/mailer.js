import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Email templates
export const emailTemplates = {
    welcome: (name) => ({
        subject: 'Selamat Datang di Mesin Cuci Store!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Halo ${name},</h2>
        <p>Selamat datang di Mesin Cuci Store - toko online mesin cuci terpercaya!</p>
        <p>Akun Anda telah berhasil dibuat. Anda sekarang dapat:</p>
        <ul>
          <li>Belanja berbagai mesin cuci berkualitas</li>
          <li>Menyimpan produk favorit ke wishlist</li>
          <li>Melacak pesanan Anda</li>
          <li>Memberikan ulasan untuk produk</li>
        </ul>
        <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi kami.</p>
        <p>Salam,<br>Tim Mesin Cuci Store</p>
      </div>
    `
    }),
    orderConfirmation: (order) => ({
        subject: `Konfirmasi Pesanan #${order.orderNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Terima kasih telah berbelanja di Mesin Cuci Store!</h2>
        <p>Pesanan Anda telah kami terima dan sedang diproses.</p>
        
        <h3>Detail Pesanan:</h3>
        <p><strong>Nomor Pesanan:</strong> ${order.orderNumber}</p>
        <p><strong>Tanggal:</strong> ${new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
        <p><strong>Total:</strong> Rp ${order.totalAmount.toLocaleString('id-ID')}</p>
        
        <h3>Rincian Produk:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${order.items.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.productName}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rp ${item.price.toLocaleString('id-ID')}</td>
            </tr>
          `).join('')}
        </table>
        
        <p>Kami akan mengirimkan update ketika pesanan Anda dikirim.</p>
        <p>Salam,<br>Tim Mesin Cuci Store</p>
      </div>
    `
    })
};

export default { transporter, emailTemplates };
