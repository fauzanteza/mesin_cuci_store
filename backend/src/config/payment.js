import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';
dotenv.config();

let snap;
let coreApi;

if (process.env.NODE_ENV === 'production') {
    // Production configuration
    snap = new midtransClient.Snap({
        isProduction: true,
        serverKey: process.env.MIDTRANS_SERVER_KEY_PROD,
        clientKey: process.env.MIDTRANS_CLIENT_KEY_PROD
    });

    coreApi = new midtransClient.CoreApi({
        isProduction: true,
        serverKey: process.env.MIDTRANS_SERVER_KEY_PROD,
        clientKey: process.env.MIDTRANS_CLIENT_KEY_PROD
    });
} else {
    // Sandbox configuration for development
    snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
        clientKey: process.env.MIDTRANS_CLIENT_KEY_SANDBOX
    });

    coreApi = new midtransClient.CoreApi({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY_SANDBOX,
        clientKey: process.env.MIDTRANS_CLIENT_KEY_SANDBOX
    });
}

// Payment methods available for Indonesia
export const paymentMethods = {
    bank_transfer: ['bca', 'bni', 'bri', 'permata', 'cimb', 'mandiri'],
    ewallet: ['gopay', 'shopeepay', 'dana', 'ovo', 'linkaja'],
    qris: ['qris'],
    cstore: ['alfamart', 'indomaret'],
    credit_card: ['credit_card']
};

// Shipping partners for Indonesia
export const shippingPartners = {
    jne: 'JNE',
    tiki: 'TIKI',
    pos: 'POS Indonesia',
    jnt: 'J&T Express',
    sicepat: 'SiCepat',
    anteraja: 'Anteraja',
    grab: 'Grab Express',
    gojek: 'GoSend'
};

export { snap, coreApi };
export default { snap, coreApi, paymentMethods, shippingPartners };
