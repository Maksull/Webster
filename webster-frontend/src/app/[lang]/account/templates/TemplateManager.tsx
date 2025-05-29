'use client';

import { useState, useEffect } from 'react';
import { Grid, List, Search } from 'lucide-react';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import { StatusMessage } from '@/components';
import { Template } from '@/types/template';
import { templateService } from '@/services/templateService';
import TemplateGrid from './TemplateGrid';
import TemplateList from './TemplateList';
import ConfirmationModal from '@/components/ConfirmationModal';
import TextInputModal from '@/components/TextInputModal';

export default function TemplateManager() {
    const { dict } = useDictionary();
    const { user, token } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        templateId: string | null;
        templateName: string;
    }>({
        isOpen: false,
        templateId: null,
        templateName: '',
    });
    const [canvasModal, setCanvasModal] = useState<{
        isOpen: boolean;
        templateId: string | null;
        templateName: string;
    }>({
        isOpen: false,
        templateId: null,
        templateName: '',
    });

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        const filtered = templates.filter(template =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
        setFilteredTemplates(filtered);
    }, [templates, searchTerm]);

    const loadTemplates = async () => {
        console.log('user:', user);
        if (!user || !token) return;

        try {
            setLoading(true);
            setError(null);
            console.log(1);
            const data = await templateService.getUserTemplates(token);
            const templatesWithDates = data.map(template => ({
                ...template,
                createdAt: new Date(template.createdAt),
                updatedAt: new Date(template.updatedAt),
            }));
            setTemplates(templatesWithDates);
        } catch (err) {
            console.error('Failed to load templates:', err);
            setError('Failed to load templates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTemplate = (id: string, name: string) => {
        setDeleteModal({
            isOpen: true,
            templateId: id,
            templateName: name,
        });
    };

    const confirmDeleteTemplate = async () => {
        if (!user || !deleteModal.templateId || !token) return;

        try {
            setIsDeleting(deleteModal.templateId);
            await templateService.deleteTemplate(deleteModal.templateId, token);
            setTemplates(prev =>
                prev.filter(template => template.id !== deleteModal.templateId),
            );
            setDeleteModal({
                isOpen: false,
                templateId: null,
                templateName: '',
            });
        } catch (err) {
            console.error('Failed to delete template:', err);
            setError('Failed to delete template. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleCreateCanvasFromTemplate = (
        templateId: string,
        templateName: string,
    ) => {
        setCanvasModal({
            isOpen: true,
            templateId,
            templateName,
        });
    };

    const confirmCreateCanvas = async (canvasName: string) => {
        if (!user || !canvasModal.templateId || !token) return;

        try {
            await templateService.createCanvasFromTemplate(
                canvasModal.templateId,
                {
                    name: canvasName,
                },
                token,
            );
            setCanvasModal({
                isOpen: false,
                templateId: null,
                templateName: '',
            });
        } catch (err) {
            console.error('Failed to create canvas from template:', err);
            setError(
                'Failed to create canvas from template. Please try again.',
            );
        }
    };

    if (loading) {
        return (
            <StatusMessage
                type="loading"
                message={
                    dict.account?.loadingTemplates || 'Loading templates...'
                }
            />
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <StatusMessage type="error" message={error} />
                <div className="text-center">
                    <button
                        onClick={loadTemplates}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        {dict.common?.tryAgain || 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {dict.account?.templatesTitle || 'My Templates'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {dict.account?.templatesDescription ||
                            'Manage your design templates'}
                    </p>
                </div>
            </div>

            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={
                            dict.account?.searchTemplates ||
                            'Search templates...'
                        }
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 text-sm font-medium transition-colors ${
                                viewMode === 'grid'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}>
                            <Grid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 text-sm font-medium transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}>
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Templates Display */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            className="h-full w-full">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm
                            ? dict.account?.noTemplatesFound ||
                              'No templates found'
                            : dict.account?.noTemplates || 'No templates yet'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchTerm
                            ? dict.account?.noTemplatesFoundDescription ||
                              'Try adjusting your search terms.'
                            : dict.account?.noTemplatesDescription ||
                              'Create your first template from a canvas to get started.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                        {viewMode === 'grid' ? (
                            <TemplateGrid
                                templates={filteredTemplates}
                                dict={dict}
                                deleteTemplate={handleDeleteTemplate}
                                createCanvasFromTemplate={
                                    handleCreateCanvasFromTemplate
                                }
                                isDeleting={isDeleting}
                            />
                        ) : (
                            <TemplateList
                                templates={filteredTemplates}
                                dict={dict}
                                deleteTemplate={handleDeleteTemplate}
                                createCanvasFromTemplate={
                                    handleCreateCanvasFromTemplate
                                }
                                isDeleting={isDeleting}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() =>
                    setDeleteModal({
                        isOpen: false,
                        templateId: null,
                        templateName: '',
                    })
                }
                onConfirm={confirmDeleteTemplate}
                title={dict.account?.deleteTemplate || 'Delete Template'}
                message={`Are you sure you want to delete "${deleteModal.templateName}"? This action cannot be undone.`}
                confirmText={dict.account?.delete || 'Delete'}
                cancelText={dict.common?.cancel || 'Cancel'}
                type="danger"
                isLoading={isDeleting === deleteModal.templateId}
            />

            {/* Create Canvas Modal */}
            <TextInputModal
                isOpen={canvasModal.isOpen}
                onClose={() =>
                    setCanvasModal({
                        isOpen: false,
                        templateId: null,
                        templateName: '',
                    })
                }
                onConfirm={confirmCreateCanvas}
                title={
                    dict.account?.createCanvasFromTemplate ||
                    'Create Canvas from Template'
                }
                message={`Enter a name for the new canvas based on "${canvasModal.templateName}".`}
                placeholder={
                    dict.account?.enterCanvasName || 'Enter canvas name...'
                }
                defaultValue={`${canvasModal.templateName} - Copy`}
                confirmText={dict.account?.create || 'Create Canvas'}
                cancelText={dict.common?.cancel || 'Cancel'}
                maxLength={255}
                required={true}
            />
        </div>
    );
}
