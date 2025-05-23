'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AlertModalProps {
    open: boolean;
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
    open,
    type,
    message,
    onClose,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-10 pointer-events-none">
            <div
                className={`rounded-lg shadow-md px-6 py-4 flex items-center w-auto pointer-events-auto ${
                    type === 'success'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
                role="alert"
                aria-live="assertive">
                {type === 'success' ? (
                    <CheckCircle className="h-5 w-5 mr-3" aria-hidden="true" />
                ) : (
                    <XCircle className="h-5 w-5 mr-3" aria-hidden="true" />
                )}
                <span className="flex-1">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label="Dismiss message">
                    <XCircle className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default AlertModal;
