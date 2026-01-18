import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendEmail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
                to,
                subject,
                html,
            });

            logger.info(`Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error('Error sending email:', error);
            throw error;
        }
    }

    async sendVerificationEmail(email, name, verificationUrl) {
        const subject = 'Verifikasi Email Anda';
        const html = `
      <h1>Halo ${name},</h1>
      <p>Terima kasih telah mendaftar. Silakan klik link di bawah ini untuk memverifikasi email Anda:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>Link ini akan kedaluwarsa dalam 24 jam.</p>
    `;
        await this.sendEmail(email, subject, html);
    }

    async sendPasswordResetEmail(email, name, resetUrl) {
        const subject = 'Reset Password Anda';
        const html = `
      <h1>Halo ${name},</h1>
      <p>Anda telah meminta untuk mereset password Anda. Silakan klik link di bawah ini:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Jika Anda tidak meminta ini, abaikan email ini.</p>
    `;
        await this.sendEmail(email, subject, html);
    }

    async sendOrderConfirmationEmail(email, name, order) {
        const subject = `Konfirmasi Pesanan #${order.order_number}`;
        const html = `
      <h1>Halo ${name},</h1>
      <p>Terima kasih telah berbelanja. Pesanan Anda #${order.order_number} telah diterima.</p>
      <p>Total: Rp ${order.total.toLocaleString()}</p>
      <p>Status: ${order.status}</p>
    `;
        await this.sendEmail(email, subject, html);
    }

    async sendOrderCancellationEmail(email, name, order, reason) {
        const subject = `Pesanan #${order.order_number} Dibatalkan`;
        const html = `
      <h1>Halo ${name},</h1>
      <p>Pesanan Anda #${order.order_number} telah dibatalkan.</p>
      <p>Alasan: ${reason}</p>
    `;
        await this.sendEmail(email, subject, html);
    }

    async sendReturnRequestEmail(returnRequest, order, user) {
        // Admin notification, maybe send to ADMIN_EMAIL?
        // For now just logging/mocking or sending to user as confirmation
        const subject = `Permintaan Return untuk Pesanan #${order.order_number}`;
        const html = `
        <h1>Halo ${user.name},</h1>
        <p>Permintaan return untuk pesanan #${order.order_number} telah diterima dan sedang diproses.</p>
      `;
        await this.sendEmail(user.email, subject, html);
    }
}

export default new EmailService();
