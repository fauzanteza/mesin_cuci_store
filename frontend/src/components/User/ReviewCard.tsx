import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge } from '../UI';
import { RatingStars } from '../Shared';

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

interface ReviewCardProps {
    review: Review;
    onDelete?: () => void;
    onHelpful?: () => void;
    showActions?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
    review,
    onDelete,
    onHelpful,
    showActions = false
}) => {
    const [showFullComment, setShowFullComment] = useState(false);
    const [helpfulClicked, setHelpfulClicked] = useState(false);

    const commentPreview = review.comment.length > 200 && !showFullComment
        ? review.comment.substring(0, 200) + '...'
        : review.comment;

    const handleHelpful = () => {
        if (!helpfulClicked && onHelpful) {
            onHelpful();
            setHelpfulClicked(true);
        }
    };

    return (
        <div className="border rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Product Image */}
                <div className="md:w-24 flex-shrink-0">
                    <Link to={`/products/${review.productSlug}`}>
                        <div className="w-full h-24 md:h-20 rounded-lg overflow-hidden">
                            <img
                                src={review.productImage}
                                alt={review.productName}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                        </div>
                    </Link>
                </div>

                {/* Review Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                        <div>
                            <Link
                                to={`/products/${review.productSlug}`}
                                className="font-bold text-lg hover:text-blue-600"
                            >
                                {review.productName}
                            </Link>
                            <div className="flex items-center gap-3 mt-1">
                                <RatingStars rating={review.rating} size="sm" />
                                <span className="text-gray-600 text-sm">
                                    {new Date(review.createdAt).toLocaleDateString('id-ID')}
                                </span>
                                {review.isVerified && (
                                    <Badge variant="success">
                                        <i className="fas fa-check-circle mr-1"></i>
                                        Verified Purchase
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                            <span className="text-sm text-gray-600">
                                Order: {review.orderId}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                        <p className="text-gray-700">
                            {commentPreview}
                            {review.comment.length > 200 && (
                                <button
                                    onClick={() => setShowFullComment(!showFullComment)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    {showFullComment ? 'Tampilkan lebih sedikit' : 'Baca selengkapnya'}
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mb-4">
                            {review.images.map((image, index) => (
                                <div
                                    key={index}
                                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => window.open(image, '_blank')}
                                >
                                    <img
                                        src={image}
                                        alt={`Review image ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleHelpful}
                                disabled={helpfulClicked}
                                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${helpfulClicked
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <i className={`fas fa-thumbs-up ${helpfulClicked ? 'text-green-600' : ''}`}></i>
                                <span>Membantu ({review.isHelpful})</span>
                                {helpfulClicked && <span className="ml-1">✓</span>}
                            </button>
                        </div>

                        {showActions && onDelete && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onDelete}
                                    icon="trash"
                                >
                                    Hapus
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
