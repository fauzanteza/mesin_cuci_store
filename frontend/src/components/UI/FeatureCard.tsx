import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-600 mb-4">
                {icon}
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

export default FeatureCard;
