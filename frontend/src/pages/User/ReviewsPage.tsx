import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { Button, LoadingSpinner, Badge, Tabs, Modal } from '../../components/UI';
import ReviewCard from '../../components/User/ReviewCard';
// import { RatingStars } from '../../components/Shared';
// import reviewService from '../../services/reviewService';

interface Review {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImage: string;
    rating: number;
    comment: string;
    images?: string[];
    createdAt: string;
    isHelpful: number;
    isVerified: boolean;
    orderId: string;
}

interface PendingReview {
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    purchasedDate: string;
}

const UserReviewsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<PendingReview | null>(null);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: '',
        images: [] as File[]
    });

    useEffect(() => {
        loadReviews();
        loadPendingReviews();
    }, []);

    const loadReviews = async () => {
        try {
            // Mock data
            const mockReviews: Review[] = [
                {
                    id: '1',
                    productId: '1',
                    productName: 'Mesin Cuci LG 8kg',
                    productSlug: 'mesin-cuci-lg-8kg',
                    productImage: '/images/products/washing-machine-1.jpg',
                    rating: 5,
                    comment: 'Sangat puas dengan pembelian ini. Mesin cuci bekerja dengan baik dan hemat listrik.',
                    images: ['/images/reviews/review-1.jpg'],
                    createdAt: '2024-01-15',
                    isHelpful: 12,
                    isVerified: true,
                    orderId: 'ORD-001'
                },
                {
                    id: '2',
                    productId: '2',
                    productName: 'Mesin Cuci Samsung 10kg',
                    productSlug: 'mesin-cuci-samsung-10kg',
                    productImage: '/images/products/washing-machine-2.jpg',
                    rating: 4,
                    comment: 'Bagus, tapi suaranya agak berisik saat spin. Overall ok.',
                    createdAt: '2024-01-10',
                    isHelpful: 5,
                    isVerified: true,
                    orderId: 'ORD-002'
                }
            ];
            setReviews(mockReviews);
        } catch (error) {
            //   Alert.error('Gagal memuat review');
            console.error(error);
        }
    };

    const loadPendingReviews = async () => {
        try {
            // Mock data
            const mockPending: PendingReview[] = [
                {
                    orderId: 'ORD-003',
                    productId: '3',
                    productName: 'Mesin Cuci Sharp 7kg',
                    productImage: '/images/products/washing-machine-3.jpg',
                    purchasedDate: '2024-02-01'
                }
            ];
            setPendingReviews(mockPending);
        } catch (error) {
            //   Alert.error('Gagal memuat produk yang perlu direview');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedProduct) return;

        if (!formData.comment.trim()) {
            //   Alert.error('Harap tulis komentar review');
            alert('Harap tulis komentar review');
            return;
        }

        try {
            const newReview: Review = {
                id: Date.now().toString(),
                productId: selectedProduct.productId,
                productName: selectedProduct.productName,
                productSlug: selectedProduct.productName.toLowerCase().replace(/ /g, '-'),
                productImage: selectedProduct.productImage,
                rating: formData.rating,
                comment: formData.comment,
                createdAt: new Date().toISOString().split('T')[0],
                isHelpful: 0,
                isVerified: true,
                orderId: selectedProduct.orderId
            };

            setReviews(prev => [newReview, ...prev]);
            setPendingReviews(prev => prev.filter(p => p.productId !== selectedProduct.productId));

            //   Alert.success('Review berhasil dikirim! Terima kasih atas feedback Anda.');
            alert('Review berhasil dikirim! Terima kasih atas feedback Anda.');
            setShowReviewForm(false);
            setSelectedProduct(null);
            setFormData({ rating: 5, comment: '', images: [] });
        } catch (error) {
            //   Alert.error('Gagal mengirim review');
            alert('Gagal mengirim review');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (window.confirm('Hapus review ini?')) {
            try {
                setReviews(prev => prev.filter(r => r.id !== reviewId));
                // Alert.success('Review berhasil dihapus');
                alert('Review berhasil dihapus');
            } catch (error) {
                // Alert.error('Gagal menghapus review');
                alert('Gagal menghapus review');
            }
        }
    };

    const handleHelpful = async (reviewId: string) => {
        setReviews(prev => prev.map(review =>
            review.id === reviewId
                ? { ...review, isHelpful: review.isHelpful + 1 }
                : review
        ));
    };

    const tabs = [
        { id: 'all', label: 'Semua Review', count: reviews.length },
        { id: 'pending', label: 'Perlu Direview', count: pendingReviews.length },
        { id: 'helpful', label: 'Paling Membantu', count: reviews.filter(r => r.isHelpful >= 5).length },
    ];

    const filteredReviews = activeTab === 'all'
        ? reviews
        : activeTab === 'helpful'
            ? reviews.filter(r => r.isHelpful >= 5)
            : [];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Review Saya</h1>
                <p className="text-gray-600">
                    Lihat dan kelola review Anda untuk produk yang dibeli
                </p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
                <Tabs
                    items={tabs.map(t => ({ ...t, content: null }))}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Pending Reviews Section */}
            {activeTab === 'pending' && pendingReviews.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Produk yang Perlu Direview</h2>
                            <p className="text-gray-600">
                                Berikan review untuk produk yang sudah Anda beli
                            </p>
                        </div>
                        <Badge variant="warning">
                            {pendingReviews.length} Menunggu
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingReviews.map(product => (
                            <div key={product.productId} className="border rounded-lg p-6">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden">
                                        <img
                                            src={product.productImage}
                                            alt={product.productName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold">{product.productName}</h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Dibeli pada {product.purchasedDate}
                                        </p>
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setShowReviewForm(true);
                                            }}
                                            icon="star"
                                        >
                                            Beri Review
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="mb-10">
                {activeTab !== 'pending' && (
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Review yang Sudah Diberikan</h2>
                            <p className="text-gray-600">
                                {filteredReviews.length} review
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setActiveTab('pending')}
                                icon="edit"
                            >
                                Review Produk Lain
                            </Button>
                        </div>
                    </div>
                )}

                {filteredReviews.length > 0 ? (
                    <div className="space-y-6">
                        {filteredReviews.map(review => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onDelete={() => handleDeleteReview(review.id)}
                                onHelpful={() => handleHelpful(review.id)}
                                showActions={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                            <i className="fas fa-star text-3xl text-yellow-600"></i>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            Belum Ada Review
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-6">
                            {activeTab === 'pending'
                                ? 'Semua produk sudah direview. Terima kasih atas kontribusi Anda!'
                                : 'Belum ada review yang diberikan. Berikan review untuk produk yang sudah dibeli.'}
                        </p>
                        {activeTab !== 'pending' && pendingReviews.length > 0 && (
                            <Button
                                variant="primary"
                                onClick={() => setActiveTab('pending')}
                                icon="star"
                            >
                                Lihat Produk yang Perlu Direview
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Review Form Modal */}
            <Modal
                isOpen={showReviewForm}
                onClose={() => {
                    setShowReviewForm(false);
                    setSelectedProduct(null);
                    setFormData({ rating: 5, comment: '', images: [] });
                }}
                title="Beri Review Produk"
                size="lg"
            >
                <form onSubmit={handleSubmitReview} className="p-6">
                    {selectedProduct && (
                        <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 rounded-lg overflow-hidden">
                                <img
                                    src={selectedProduct.productImage}
                                    alt={selectedProduct.productName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h3 className="font-bold">{selectedProduct.productName}</h3>
                                <p className="text-sm text-gray-600">
                                    Dibeli pada {selectedProduct.purchasedDate}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Rating *
                            </label>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                        className="text-3xl focus:outline-none"
                                    >
                                        <i
                                            className={`fas fa-star ${star <= formData.rating
                                                ? 'text-yellow-500'
                                                : 'text-gray-300'
                                                }`}
                                        ></i>
                                    </button>
                                ))}
                                <span className="ml-3 text-lg font-bold">
                                    {formData.rating}.0
                                </span>
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Komentar Review *
                            </label>
                            <textarea
                                value={formData.comment}
                                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={5}
                                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                                required
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Minimum 10 karakter
                            </p>
                        </div>

                        {/* Photo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Foto Produk (Opsional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                <i className="fas fa-camera text-3xl text-gray-400 mb-3"></i>
                                <p className="text-gray-600 mb-3">
                                    Unggah foto produk untuk melengkapi review
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    icon="upload"
                                >
                                    Pilih File
                                </Button>
                                <p className="text-xs text-gray-500 mt-3">
                                    JPG, PNG maks. 5MB
                                </p>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <i className="fas fa-lightbulb"></i>
                                Tips Review yang Baik:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Jelaskan kualitas produk dan performanya</li>
                                <li>• Sertakan foto asli produk yang Anda terima</li>
                                <li>• Sebutkan kelebihan dan kekurangan</li>
                                <li>• Bagikan pengalaman pengiriman dan layanan</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setShowReviewForm(false);
                                setSelectedProduct(null);
                                setFormData({ rating: 5, comment: '', images: [] });
                            }}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            disabled={!formData.comment.trim()}
                        >
                            Kirim Review
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Review Guidelines */}
            <div className="mt-12 border-t pt-8">
                <h3 className="font-bold text-lg mb-4">Pedoman Review</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-bold text-green-800 mb-2">Yang Boleh:</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                            <li>✓ Review berdasarkan pengalaman pribadi</li>
                            <li>✓ Foto produk asli yang Anda terima</li>
                            <li>✓ Komentar yang membantu pembeli lain</li>
                            <li>✓ Feedback konstruktif untuk penjual</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <h4 className="font-bold text-red-800 mb-2">Yang Tidak Boleh:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                            <li>✗ Konten SARA atau diskriminatif</li>
                            <li>✗ Informasi pribadi orang lain</li>
                            <li>✗ Review fiktif atau tidak relevan</li>
                            <li>✗ Promosi atau link eksternal</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserReviewsPage;
