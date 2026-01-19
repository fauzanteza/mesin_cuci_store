import React from 'react';

interface AlertProps {
    children: React.ReactNode;
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    className?: string;
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
    children,
    variant = 'info',
    title,
    className = '',
    onClose
}) => {
    const variants = {
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        success: 'bg-green-50 text-green-700 border-green-200',
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        error: 'bg-red-50 text-red-700 border-red-200'
    };

    const icons = {
        info: 'info-circle',
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'exclamation-circle'
    };

    return (
        <div className={`border rounded-md p-4 flex gap-3 ${variants[variant]} ${className}`}>
            <div className="flex-shrink-0">
                <i className={`fas fa-${icons[variant]} mt-0.5`}></i>
            </div>
            <div className="flex-1">
                {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
                <div className="text-sm opacity-90">{children}</div>
            </div>
            {onClose && (
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <i className="fas fa-times"></i>
                </button>
            )}
        </div>
    );
};

export default Alert;
