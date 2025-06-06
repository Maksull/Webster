'use client';

import { Template } from '@/types/template';
import { Copy, Trash2, Clock, File, Loader } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useState } from 'react';

type TemplateListProps = {
    templates: Template[];
    dict: Dictionary;
    deleteTemplate: (id: string, name: string) => void;
    createCanvasFromTemplate: (
        templateId: string,
        templateName: string,
    ) => void;
    isDeleting: string | null;
};

export default function TemplateList({
    templates,
    dict,
    deleteTemplate,
    createCanvasFromTemplate,
    isDeleting,
}: TemplateListProps) {
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
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {templates.map(template => (
                <div
                    key={template.id}
                    className="group py-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded-lg transition-all duration-300 ease-out hover:shadow-md hover:shadow-purple-500/5 hover:scale-[1.005]">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden relative mr-4 group-hover:shadow-sm transition-shadow duration-300">
                        {template.thumbnail ? (
                            <div
                                className="h-full w-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${template.thumbnail})`,
                                }}></div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <File className="h-6 w-6" />
                            </div>
                        )}
                        {/* Template background color overlay */}
                        <div
                            className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity duration-300"
                            style={{
                                backgroundColor:
                                    template.backgroundColor || '#FFFFFF',
                            }}></div>
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                                    {template.name}
                                </h3>
                                {template.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        {template.description}
                                    </p>
                                )}
                            </div>

                            <div className="ml-4 flex-shrink-0 flex space-x-1 opacity-70 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                                <button
                                    onClick={() =>
                                        handleCreateCanvas(
                                            template.id,
                                            template.name,
                                        )
                                    }
                                    disabled={creatingCanvas === template.id}
                                    className="cursor-pointer p-1.5 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-all duration-200"
                                    title={
                                        dict.account
                                            ?.createCanvasFromTemplate ||
                                        'Create canvas from template'
                                    }>
                                    {creatingCanvas === template.id ? (
                                        <Loader className="sm:h-4 sm:w-4 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Copy className="sm:h-4 sm:w-4 h-5 w-5" />
                                    )}
                                </button>

                                <button
                                    onClick={() =>
                                        handleDeleteTemplate(
                                            template.id,
                                            template.name,
                                        )
                                    }
                                    disabled={isDeleting === template.id}
                                    className="cursor-pointer p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50 transition-all duration-200"
                                    title={
                                        dict.account?.deleteTemplate ||
                                        'Delete template'
                                    }>
                                    {isDeleting === template.id ? (
                                        <Loader className="sm:h-4 sm:w-4 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="sm:h-4 sm:w-4 h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                            <span className="inline-flex items-center group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {template.updatedAt.toLocaleDateString()}
                            </span>

                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 group-hover:scale-105 transition-all duration-300">
                                {template.width}x{template.height}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
