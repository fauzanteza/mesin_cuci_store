import React from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Radio: React.FC<RadioProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`flex items-start ${className}`}>
            <div className="flex items-center h-5">
                <input
                    type="radio"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    {...props}
                />
            </div>
            {(label || error) && (
                <div className="ml-3 text-sm">
                    {label && <label className="font-medium text-gray-700">{label}</label>}
                    {error && <p className="text-red-500 mt-1">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default Radio;
