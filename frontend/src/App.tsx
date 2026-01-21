import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { store, persistor } from './store'
import Layout from './components/Layout/Layout'
import { LoadingSpinner } from './components/UI'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import ScrollToTop from './components/UI/ScrollToTop'

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))

const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'))

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'))

// User Pages
const UserDashboardPage = lazy(() => import('./pages/User/DashboardPage'))
const UserOrdersPage = lazy(() => import('./pages/User/OrdersPage'))
const UserOrderDetailPage = lazy(() => import('./pages/User/OrderDetailPage'))
const ProfilePage = lazy(() => import('./pages/User/ProfilePage'))
const AddressesPage = lazy(() => import('./pages/User/AddressesPage'))
const WishlistPage = lazy(() => import('./pages/User/WishlistPage'))
const UserSettingsPage = lazy(() => import('./pages/User/UserSettingsPage'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/Admin/DashboardPage'))
const AdminProducts = lazy(() => import('./pages/Admin/ProductsPage')) // Corrected path if needed, previously 'Products'
const AdminOrders = lazy(() => import('./pages/Admin/OrdersPage')) // Corrected path if needed, previously 'Orders'
const AdminCustomers = lazy(() => import('./pages/Admin/UsersPage')) // Corrected path to UsersPage based on list
const AdminReports = lazy(() => import('./pages/Admin/ReportsPage')) // Corrected path based on list
const AdminSettings = lazy(() => import('./pages/Admin/SettingsPage'))
const AdminLogs = lazy(() => import('./pages/Admin/LogsPage'))

// Static Pages
const AboutPage = lazy(() => import('./pages/Static/AboutPage'))
const ContactPage = lazy(() => import('./pages/Static/ContactPage'))
const FAQPage = lazy(() => import('./pages/Static/FAQPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/Static/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./pages/Static/TermsPage'))
const ShippingPolicyPage = lazy(() => import('./pages/Static/ShippingPolicyPage'))
const NotFoundPage = lazy(() => import('./pages/Static/NotFoundPage'))

function App() {
    return (
        <Provider store={store}>
            <PersistGate loading={<LoadingSpinner fullScreen />} persistor={persistor}>
                <ScrollToTop />
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Layout />}>
                            <Route index element={<HomePage />} />
                            <Route path="products" element={<ProductsPage />} />
                            <Route path="products/:id" element={<ProductDetailPage />} />
                            <Route path="cart" element={<CartPage />} />

                            {/* Static Pages */}
                            <Route path="about" element={<AboutPage />} />
                            <Route path="contact" element={<ContactPage />} />
                            <Route path="faq" element={<FAQPage />} />
                            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                            <Route path="terms" element={<TermsPage />} />
                            <Route path="shipping-policy" element={<ShippingPolicyPage />} />

                            {/* Auth Routes */}
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<RegisterPage />} />

                            {/* Protected User Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
                                <Route path="checkout" element={<CheckoutPage />} />
                                <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />

                                <Route path="user">
                                    <Route path="dashboard" element={<UserDashboardPage />} />
                                    <Route path="orders" element={<UserOrdersPage />} />
                                    <Route path="orders/:id" element={<UserOrderDetailPage />} />
                                    <Route path="addresses" element={<AddressesPage />} />
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="wishlist" element={<WishlistPage />} />
                                    <Route path="settings" element={<UserSettingsPage />} />
                                </Route>
                            </Route>

                            {/* Admin Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="admin">
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="customers" element={<AdminCustomers />} />
                                    <Route path="reports" element={<AdminReports />} />
                                    <Route path="settings" element={<AdminSettings />} />
                                    <Route path="logs" element={<AdminLogs />} />
                                </Route>
                            </Route>

                            {/* 404 */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </Suspense>
            </PersistGate>
        </Provider>
    )
}

export default App
