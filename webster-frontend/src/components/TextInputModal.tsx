'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Copy } from 'lucide-react';

interface TextInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    maxLength?: number;
    required?: boolean;
}

const TextInputModal: React.FC<TextInputModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    placeholder = 'Enter text...',
    defaultValue = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    maxLength = 255,
    required = true,
}) => {
    const [value, setValue] = useState(defaultValue);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setError('');
            // Focus input when modal opens
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [isOpen, defaultValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (required && !value.trim()) {
            setError('This field is required');
            return;
        }

        onConfirm(value.trim());
    };

    const handleClose = () => {
        if (!isLoading) {
            setValue('');
            setError('');
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-0"
            role="dialog"
            aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-gray-500/30 dark:bg-gray-900/30 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <Copy className="h-5 w-5 text-purple-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                        aria-label="Close modal">
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {message && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {message}
                        </p>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Input */}
                    <div className="mb-6">
                        <input
                            ref={inputRef}
                            type="text"
                            value={value}
                            onChange={e => {
                                setValue(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 transition-colors"
                            maxLength={maxLength}
                            required={required}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <div></div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {value.length}/{maxLength} characters
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50">
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || (required && !value.trim())}
                            className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TextInputModal;
