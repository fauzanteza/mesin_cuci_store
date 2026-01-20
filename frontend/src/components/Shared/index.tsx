import React from 'react';

export const RatingStars = ({ rating, size = 'md' }: any) => {
    // rating is e.g. 4.5
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) {
            stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
        } else if (rating >= i - 0.5) {
            stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
        } else {
            stars.push(<i key={i} className="far fa-star text-gray-300"></i>);
        }
    }
    return <div className={`flex gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{stars}</div>;
};

export const PriceDisplay = ({ price, originalPrice, size = 'md', showDiscount = false }: any) => (
    <div>
        <div className="flex items-center gap-2">
            <span className={`font-bold text-gray-900 ${size === 'lg' ? 'text-xl' : size === '2xl' ? 'text-3xl' : 'text-base'}`}>
                Rp {price?.toLocaleString()}
            </span>
            {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">
                    Rp {originalPrice?.toLocaleString()}
                </span>
            )}
        </div>
        {showDiscount && originalPrice && (
            <div className="text-green-600 text-sm font-medium mt-1">
                Hemat Rp {(originalPrice - price).toLocaleString()}
            </div>
        )}
    </div>
);

export { default as RichTextEditor } from './RichTextEditor';
