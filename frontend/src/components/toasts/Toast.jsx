import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!message) return null;

    const getStyles = () => {
        switch (type) {
            case 'error':
                return 'bg-red-600 text-white font-medium rounded-full';
            case 'warning':
                return 'bg-yellow-600 text-white font-medium rounded-full';
            case 'success':
            default:
                return 'bg-green-600 text-white font-medium rounded-full';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <XCircle className="w-5 h-5 flex-shrink-0" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 flex-shrink-0" />;
            case 'success':
            default:
                return <CheckCircle2 className="w-5 h-5 flex-shrink-0" />;
        }
    };

    return (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-2 shadow-lg animate-fade-in ${getStyles()} font-dm-sans min-w-[280px]`}>
            {getIcon()}
            <div className="flex-1 text-sm md:text-base">
                {message}
            </div>
            <button
                onClick={onClose}
                className="opacity-70 hover:opacity-100 transition-opacity ml-2 focus:outline-none"
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
