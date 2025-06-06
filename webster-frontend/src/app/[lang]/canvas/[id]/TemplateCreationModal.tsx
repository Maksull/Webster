'use client';

import React, { useState } from 'react';
import { X, Bookmark } from 'lucide-react';

interface TemplateCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; description?: string }) => Promise<void>;
    defaultName?: string;
}

const TemplateCreationModal: React.FC<TemplateCreationModalProps> = ({
    isOpen,
    onClose,
    onSave,
    defaultName = '',
}) => {
    const [name, setName] = useState(defaultName);
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Template name is required');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await onSave({
                name: name.trim(),
                description: description.trim() || undefined,
            });
            setName('');
            setDescription('');
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create template',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setName('');
            setDescription('');
            setError('');
            onClose();
        }
    };

    React.useEffect(() => {
        if (defaultName && defaultName !== name) {
            setName(defaultName);
        }
    }, [defaultName]);

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
            <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <Bookmark className="h-5 w-5 text-purple-500 mr-2" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Save as Template
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                        aria-label="Close modal">
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Template Name */}
                    <div>
                        <label
                            htmlFor="template-name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Template Name*
                        </label>
                        <input
                            id="template-name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter template name..."
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 transition-colors"
                            maxLength={255}
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {name.length}/255 characters
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="template-description"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="template-description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe what this template is for... (optional)"
                            disabled={isLoading}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 resize-none transition-colors"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {description.length}/500 characters
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="flex items-start">
                            <Bookmark className="h-5 w-5 text-purple-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                    Personal Template
                                </h4>
                                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                    This template will be saved to your personal
                                    collection and can be used to create new
                                    canvases with the same design.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
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
                                    Creating...
                                </>
                            ) : (
                                'Create Template'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TemplateCreationModal;
