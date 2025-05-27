'use client';

import { Copy, Trash2, Calendar, File, Loader } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useState } from 'react';
import { Template } from '@/types/template';

type TemplateGridProps = {
    templates: Template[];
    lang: string;
    dict: Dictionary;
    deleteTemplate: (id: string, name: string) => void;
    createCanvasFromTemplate: (
        templateId: string,
        templateName: string,
    ) => void;
    isDeleting: string | null;
};

export default function TemplateGrid({
    templates,
    lang,
    dict,
    deleteTemplate,
    createCanvasFromTemplate,
    isDeleting,
}: TemplateGridProps) {
    const [creatingCanvas, setCreatingCanvas] = useState<string | null>(null);

    const handleCreateCanvas = async (
        templateId: string,
        templateName: string,
    ) => {
        try {
            setCreatingCanvas(templateId);
            createCanvasFromTemplate(templateId, templateName);
        } finally {
            setCreatingCanvas(null);
        }
    };

    const handleDeleteTemplate = (templateId: string, templateName: string) => {
        deleteTemplate(templateId, templateName);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
                <div
                    key={template.id}
                    className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:scale-[1.02] transition-all duration-300 ease-out">
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-600 overflow-hidden">
                        {template.thumbnail ? (
                            <div
                                className="h-full w-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${template.thumbnail})`,
                                }}></div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <File className="h-8 w-8" />
                            </div>
                        )}
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                    </div>

                    <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                    {template.name}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                    <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                    {template.updatedAt.toLocaleDateString()}
                                </p>
                            </div>

                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-1 group-hover:translate-y-0 ml-2">
                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCreateCanvas(
                                            template.id,
                                            template.name,
                                        );
                                    }}
                                    disabled={creatingCanvas === template.id}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-white/20 dark:hover:bg-gray-800/50 rounded disabled:opacity-50 relative z-20 transition-all duration-200"
                                    title={
                                        dict.account
                                            ?.createCanvasFromTemplate ||
                                        'Create canvas from template'
                                    }>
                                    {creatingCanvas === template.id ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>

                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteTemplate(
                                            template.id,
                                            template.name,
                                        );
                                    }}
                                    disabled={isDeleting === template.id}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/20 dark:hover:bg-gray-800/50 rounded disabled:opacity-50 relative z-20 transition-all duration-200"
                                    title={
                                        dict.account?.deleteTemplate ||
                                        'Delete template'
                                    }>
                                    {isDeleting === template.id ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {template.description && (
                            <div className="mb-3">
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                                    {template.description}
                                </p>
                            </div>
                        )}

                        <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-colors duration-300">
                                {template.width}x{template.height}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
