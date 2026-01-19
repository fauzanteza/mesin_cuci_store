// frontend/src/components/Checkout/CheckoutSteps.tsx
import React from 'react';

interface Step {
    number: number;
    title: string;
    icon?: string;
}

interface CheckoutStepsProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
    steps,
    currentStep,
    className = ''
}) => {
    return (
        <div className={`checkout-steps ${className}`}>
            <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200 -translate-y-1/2">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
                        }}
                    ></div>
                </div>

                {/* Steps */}
                <div className="flex justify-between relative z-10">
                    {steps.map((step) => {
                        const isCompleted = step.number < currentStep;
                        const isCurrent = step.number === currentStep;
                        const isUpcoming = step.number > currentStep;

                        return (
                            <div key={step.number} className="flex flex-col items-center">
                                {/* Step Circle */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    border-2 transition-all duration-300
                    ${isCompleted ? 'bg-blue-600 border-blue-600' : ''}
                    ${isCurrent ? 'bg-white border-blue-600' : ''}
                    ${isUpcoming ? 'bg-white border-gray-300' : ''}
                  `}
                                >
                                    {isCompleted ? (
                                        <i className="fas fa-check text-white text-sm"></i>
                                    ) : (
                                        <span className={`
                      text-sm font-bold
                      ${isCurrent ? 'text-blue-600' : 'text-gray-400'}
                    `}>
                                            {step.number}
                                        </span>
                                    )}
                                </div>

                                {/* Step Title */}
                                <div className="mt-3 text-center">
                                    <div className={`
                    text-xs font-medium
                    ${isCompleted || isCurrent ? 'text-blue-600' : 'text-gray-500'}
                  `}>
                                        {step.icon && (
                                            <i className={`fas fa-${step.icon} mr-1`}></i>
                                        )}
                                        {step.title}
                                    </div>
                                </div>

                                {/* Step Number */}
                                <div className="mt-1 text-xs text-gray-400">
                                    Langkah {step.number}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CheckoutSteps;
