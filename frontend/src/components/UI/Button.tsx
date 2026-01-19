import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'text' | 'ghost'; // Added ghost for compatibility
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    isLoading?: boolean; // Added for compatibility with older usages
    icon?: any; // Changed to any to accept string or ReactNode
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    isLoading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    // Handle both loading props
    const isBusy = loading || isLoading;

    const baseClasses = 'btn inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        text: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500', // Added ghost variant
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const classes = [
        baseClasses,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
    ].join(' ');

    const renderIcon = (i: any) => {
        if (typeof i === 'string') {
            return <i className={`fas fa-${i}`}></i>;
        }
        return i;
    }

    return (
        <button
            className={classes}
            disabled={disabled || isBusy}
            {...props}
        >
            {isBusy && (
                <span className="mr-2">
                    <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </span>
            )}

            {icon && iconPosition === 'left' && !isBusy && (
                <span className="mr-2">{renderIcon(icon)}</span>
            )}

            {children}

            {icon && iconPosition === 'right' && (
                <span className="ml-2">{renderIcon(icon)}</span>
            )}
        </button>
    );
};

export default Button;
