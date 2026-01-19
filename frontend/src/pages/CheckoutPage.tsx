// frontend/src/pages/CheckoutPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartItems, selectCartTotal } from '../store/slices/cartSlice'; // Removed clearCart if not used or import it if logic uncomments
// Note: user code had commented out dispatch(clearCart()). I'll keep import if used, or remove if unused. 
// User code: "import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice';"
// But usage: "// dispatch(clearCart());". 
// I will include clearCart in import just in case, but unused var warning might occur. I'll omit unused for cleanliness if it's commented out.
import { useAuth } from '../hooks/useAuth';
import { CheckoutSteps, AddressForm, ShippingMethod, PaymentMethod, OrderSummary } from '../components/Checkout';
import { Button, Alert } from '../components/UI';

const CheckoutPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [selectedShipping, setSelectedShipping] = useState<any>(null);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const { user } = useAuth();
    const navigate = useNavigate();

    const steps = [
        { number: 1, title: 'Alamat Pengiriman' },
        { number: 2, title: 'Metode Pengiriman' },
        { number: 3, title: 'Pembayaran' },
        { number: 4, title: 'Konfirmasi' },
    ];

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handlePlaceOrder = async () => {
        try {
            // API call to create order
            const orderData = {
                userId: user?.id,
                items: cartItems,
                shippingAddress: selectedAddress,
                shippingMethod: selectedShipping,
                paymentMethod: selectedPayment,
                total: cartTotal,
            };

            // Clear cart and redirect to confirmation
            // await orderService.createOrder(orderData);
            // dispatch(clearCart());

            navigate('/order-confirmation', {
                state: { orderId: 'ORDER123' }
            });
        } catch (error) {
            // Alert.error('Gagal membuat pesanan'); 
            // Alert component I assume has static method error? 
            // My Alert.tsx (Step 810) export { default as Alert } from './Alert'. 
            // Usually Alert component is <Alert variant="error">...</Alert>. 
            // Be careful with "Alert.error()". 
            // If user code expects it, I'll leave it but it might fail if Alert is just a component.
            console.error('Order failed', error);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold mb-4">Keranjang Kosong</h1>
                <p className="mb-8">Tambahkan produk ke keranjang terlebih dahulu</p>
                <Button onClick={() => navigate('/products')}>
                    Lihat Produk
                </Button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                {/* Checkout Steps */}
                <CheckoutSteps steps={steps} currentStep={step} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Checkout Forms */}
                    <div className="lg:col-span-2">
                        {step === 1 && (
                            <AddressForm
                                onSelect={setSelectedAddress}
                                selectedAddress={selectedAddress}
                                onNext={handleNext}
                            />
                        )}

                        {step === 2 && (
                            <ShippingMethod
                                onSelect={setSelectedShipping}
                                selectedMethod={selectedShipping}
                                onBack={handleBack}
                                onNext={handleNext}
                            />
                        )}

                        {step === 3 && (
                            <PaymentMethod
                                onSelect={setSelectedPayment}
                                selectedMethod={selectedPayment}
                                onBack={handleBack}
                                onNext={handleNext}
                            />
                        )}

                        {step === 4 && (
                            <div className="confirmation-step">
                                <h2 className="text-xl font-bold mb-4">Konfirmasi Pesanan</h2>
                                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                                    <h3 className="font-bold mb-2">Alamat Pengiriman</h3>
                                    <p>{selectedAddress?.name}</p>
                                    <p>{selectedAddress?.address}</p>
                                    <p>{selectedAddress?.city}, {selectedAddress?.postalCode}</p>
                                    <p>{selectedAddress?.phone}</p>
                                </div>

                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={handleBack}>
                                        Kembali
                                    </Button>
                                    <Button variant="primary" onClick={handlePlaceOrder}>
                                        Buat Pesanan
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <OrderSummary
                            items={cartItems}
                            subtotal={cartTotal}
                            shippingCost={selectedShipping?.cost || 0}
                            onEditCart={() => navigate('/cart')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
