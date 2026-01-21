// frontend/src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice';
import { useAuth } from '../hooks/useAuth';
import { CheckoutSteps, AddressForm, ShippingMethod, PaymentMethod, OrderSummary } from '../components/Checkout';
import { Button, LoadingSpinner, Modal } from '../components/UI';
// import orderService from '../services/orderService';
import MidtransPayment from '../components/Payment/MidtransPayment';
import ManualPaymentUpload from '../components/Payment/ManualPaymentUpload';

const CheckoutPage: React.FC = () => {
    // ... existing state ...
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [shippingMethods, setShippingMethods] = useState<any[]>([]);
    const [selectedShipping, setSelectedShipping] = useState<any>(null);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [orderNotes, setOrderNotes] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [orderData, setOrderData] = useState<any>(null);

    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal);
    const { user, isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ... existing steps ...
    const steps = [
        { number: 1, title: 'Alamat Pengiriman', icon: 'map-marker-alt' },
        { number: 2, title: 'Pengiriman', icon: 'truck' },
        { number: 3, title: 'Pembayaran', icon: 'credit-card' },
        { number: 4, title: 'Konfirmasi', icon: 'check-circle' },
    ];

    // ... useEffects ...
    // Load user addresses
    useEffect(() => {
        if (isAuthenticated && user) {
            loadUserAddresses();
        }
    }, [isAuthenticated, user]);

    // Load shipping methods
    useEffect(() => {
        if (selectedAddress) {
            loadShippingMethods();
        }
    }, [selectedAddress]);

    // Load payment methods
    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadUserAddresses = async () => {
        try {
            // In real app: const response = await addressService.getUserAddresses();
            const mockAddresses = [
                {
                    id: '1',
                    name: 'Rumah',
                    recipient: user?.name || 'Customer',
                    phone: user?.phone || '081234567890',
                    address: 'Jl. Merdeka No. 123',
                    city: 'Jakarta Pusat',
                    province: 'DKI Jakarta',
                    postalCode: '10110',
                    isDefault: true,
                },
                {
                    id: '2',
                    name: 'Kantor',
                    recipient: user?.name,
                    phone: '081298765432',
                    address: 'Jl. Sudirman No. 456',
                    city: 'Jakarta Selatan',
                    province: 'DKI Jakarta',
                    postalCode: '12190',
                    isDefault: false,
                },
            ];
            setAddresses(mockAddresses);
            const defaultAddress = mockAddresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
            }
        } catch (error) {
            console.error('Failed to load addresses:', error);
        }
    };

    // ... loadShippingMethods, loadPaymentMethods, handlers ...
    const loadShippingMethods = async () => {
        try {
            const mockMethods = [
                { id: '1', name: 'Reguler', provider: 'JNE', cost: 25000, estimatedDays: '3-5 hari', description: 'Pengiriman standar' },
                { id: '2', name: 'Express', provider: 'JNE', cost: 45000, estimatedDays: '1-2 hari', description: 'Pengiriman cepat' },
                { id: '3', name: 'Same Day', provider: 'GoSend', cost: 35000, estimatedDays: 'Hari yang sama', description: 'Pengiriman instant' },
            ];
            setShippingMethods(mockMethods);
        } catch (error) {
            console.error(error);
        }
    };

    const loadPaymentMethods = async () => {
        try {
            const mockMethods = [
                { id: '1', name: 'Bank Transfer', type: 'bank_transfer', icon: 'university', banks: ['BCA', 'Mandiri', 'BNI', 'BRI'], description: 'Transfer ke rekening bank' },
                { id: '2', name: 'E-Wallet', type: 'ewallet', icon: 'wallet', wallets: ['Gopay', 'OVO', 'Dana', 'ShopeePay'], description: 'Bayar dengan e-wallet' },
                { id: '3', name: 'Credit Card', type: 'credit_card', icon: 'credit-card', cards: ['Visa', 'MasterCard'], description: 'Bayar dengan kartu kredit' },
                { id: '4', name: 'COD', type: 'cod', icon: 'money-bill-wave', description: 'Bayar di tempat' },
            ];
            setPaymentMethods(mockMethods);
        } catch (error) {
            console.error(error);
        }
    };

    const handleNext = () => step < 4 && setStep(step + 1);
    const handleBack = () => step > 1 && setStep(step - 1);
    const handleContinueShopping = () => navigate('/products');
    const handleEditCart = () => navigate('/cart');

    const handlePlaceOrder = async () => {
        if (!selectedAddress || !selectedShipping || !selectedPayment) {
            window.alert('Harap lengkapi semua informasi');
            return;
        }

        setLoading(true);
        try {
            const subtotal = cartTotal;
            const shippingCost = selectedShipping.cost || 0;
            const tax = subtotal * 0.11;
            const total = subtotal + shippingCost + tax;

            const orderPayload = {
                userId: user?.id || 'guest',
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    image: item.product.images?.[0]?.image_url,
                })),
                shippingAddress: selectedAddress,
                shippingMethod: selectedShipping,
                paymentMethod: selectedPayment,
                subtotal,
                shippingCost,
                tax,
                total,
                notes: orderNotes,
            };

            const mockOrder = {
                id: `ORD-${Date.now()}`,
                orderNumber: `ORD${Date.now()}`,
                ...orderPayload,
                status: 'pending',
                createdAt: new Date().toISOString(),
                total
            };

            setOrderData(mockOrder);
            setOrderNumber(mockOrder.orderNumber);
            dispatch(clearCart());
            setShowSuccessModal(true);

        } catch (error: any) {
            console.error('Order creation failed:', error);
            window.alert('Gagal membuat pesanan: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => { setShowSuccessModal(false); navigate(`/order-confirmation/${orderNumber}`); };
    const handlePaymentError = (error: string) => { window.alert(`Pembayaran Gagal: ${error}`); };
    const handleSuccessModalClose = () => { setShowSuccessModal(false); navigate(`/order-confirmation/${orderNumber}`); };

    if (!isAuthenticated) return (
        <div className="container mx-auto px-4 py-16 text-center">
            <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
    );

    if (cartItems.length === 0 && !orderData) return (<div className="text-center p-16"><Button onClick={handleContinueShopping}>Mulai Belanja</Button></div>);

    return (
        <div className="checkout-page min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8"><h1 className="text-3xl font-bold">Checkout</h1></div>
                <CheckoutSteps steps={steps} currentStep={step} className="mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            {step === 1 && <AddressForm addresses={addresses} selectedAddress={selectedAddress} onSelect={setSelectedAddress} onNext={handleNext} onAddNew={() => navigate('/user/addresses')} />}
                            {step === 2 && <ShippingMethod methods={shippingMethods} selectedMethod={selectedShipping} onSelect={setSelectedShipping} onBack={handleBack} onNext={handleNext} address={selectedAddress} />}
                            {step === 3 && <PaymentMethod methods={paymentMethods} selectedMethod={selectedPayment} onSelect={setSelectedPayment} onBack={handleBack} onNext={handleNext} />}
                            {step === 4 && (
                                <div className="confirmation-step">
                                    <div className="mb-8"><h2 className="text-2xl font-bold mb-6">Konfirmasi Pesanan</h2>
                                        <div className="mb-6"><textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} className="w-full border p-2" placeholder="Catatan" /></div>
                                    </div>
                                    <div className="flex gap-4"><Button variant="outline" onClick={handleBack} className="flex-1">Kembali</Button><Button variant="primary" onClick={handlePlaceOrder} loading={loading} className="flex-1">Buat Pesanan</Button></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <OrderSummary
                            subtotal={cartTotal}
                            shippingCost={selectedShipping?.cost}
                            paymentMethod={selectedPayment}
                            onEditCart={handleEditCart}
                            className="sticky top-4"
                        />
                    </div>
                </div>
            </div>

            <Modal isOpen={showSuccessModal} onClose={handleSuccessModalClose} size="lg" title="Pembayaran">
                <div className="p-4">
                    {orderData ? (
                        <>
                            {(selectedPayment?.type === 'credit_card' || selectedPayment?.type === 'ewallet') ? (
                                <MidtransPayment
                                    orderId={orderData.orderNumber}
                                    amount={orderData.total}
                                    customerDetails={{
                                        name: user?.name || 'Customer',
                                        email: user?.email || 'email@example.com',
                                        phone: user?.phone || '08123456789'
                                    }}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                />
                            ) : selectedPayment?.type === 'bank_transfer' ? (
                                <ManualPaymentUpload orderId={orderData.id} amount={orderData.total} />
                            ) : (
                                <div className="text-center"><Button onClick={handlePaymentSuccess}>Selesai</Button></div>
                            )}
                        </>
                    ) : <LoadingSpinner />}
                </div>
            </Modal>
        </div>
    );
};
export default CheckoutPage;
