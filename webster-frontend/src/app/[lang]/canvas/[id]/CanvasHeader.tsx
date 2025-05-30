'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, Save, Download, Bookmark, Edit3 } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useDrawing } from '@/contexts/DrawingContext';
import SocialShare from './SocialShare';

interface CanvasHeaderProps {
    dict: Dictionary;
    lang: string;
    onSave: () => void;
    onDownload: (options: {
        format: 'png' | 'jpeg' | 'pdf';
        quality?: number;
        pixelRatio?: number;
    }) => Promise<string | void>;
    onSaveAsTemplate: () => void;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({
    dict,
    lang,
    onSave,
    onDownload,
    onSaveAsTemplate,
}) => {
    const {
        setIsMobileMenuOpen,
        canvasName,
        setCanvasName,
        canvasDescription,
        setCanvasDescription,
    } = useDrawing();
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [nameInput, setNameInput] = useState(
        canvasName || dict.drawing?.untitledDesign || 'Untitled Design',
    );
    const [descriptionInput, setDescriptionInput] = useState(
        canvasDescription || '',
    );
    const nameInputRef = useRef<HTMLInputElement>(null);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
    const [downloadFormat, setDownloadFormat] = useState<
        'png' | 'jpeg' | 'pdf'
    >('png');

    useEffect(() => {
        setNameInput(
            canvasName || dict.drawing?.untitledDesign || 'Untitled Design',
        );
    }, [canvasName, dict.drawing?.untitledDesign]);

    useEffect(() => {
        setDescriptionInput(canvasDescription || '');
    }, [canvasDescription]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prevState => !prevState);
    };

    const startEditingName = () => {
        setIsEditingName(true);
    };

    const stopEditingName = () => {
        setIsEditingName(false);
        if (nameInput.trim() === '') {
            setNameInput(dict.drawing?.untitledDesign || 'Untitled Design');
        } else {
            setCanvasName(nameInput);
        }
    };

    const startEditingDescription = () => {
        setIsEditingDescription(true);
    };

    const stopEditingDescription = () => {
        setIsEditingDescription(false);
        setCanvasDescription(descriptionInput);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value);
    };

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setDescriptionInput(e.target.value);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            stopEditingName();
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
            setNameInput(
                canvasName || dict.drawing?.untitledDesign || 'Untitled Design',
            );
        }
    };

    const handleDescriptionKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            stopEditingDescription();
        } else if (e.key === 'Escape') {
            setIsEditingDescription(false);
            setDescriptionInput(canvasDescription || '');
        }
    };

    useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    useEffect(() => {
        if (isEditingDescription && descriptionInputRef.current) {
            descriptionInputRef.current.focus();
            descriptionInputRef.current.select();
        }
    }, [isEditingDescription]);

    const handleDownload = async (options: {
        format: 'png' | 'jpeg' | 'pdf';
        quality?: number;
        pixelRatio?: number;
    }) => {
        return await onDownload(options);
    };

    return (
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-4 py-3 z-10">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center flex-1">
                    <Link
                        href={`/${lang}/account`}
                        className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        title={dict.drawing?.back || 'Back'}>
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-gray-300" />
                    </Link>
                    <div className="flex-1 max-w-md">
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={nameInput}
                                onChange={handleNameChange}
                                onBlur={stopEditingName}
                                onKeyDown={handleNameKeyDown}
                                className="text-lg font-medium text-slate-800 dark:text-white bg-transparent border-b border-indigo-500 focus:outline-none px-1 w-full"
                            />
                        ) : (
                            <h1
                                className="text-lg font-medium text-slate-800 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate"
                                onClick={startEditingName}
                                title={
                                    dict.drawing?.editName ||
                                    'Click to edit name'
                                }>
                                {canvasName ||
                                    dict.drawing?.untitledDesign ||
                                    'Untitled Design'}
                            </h1>
                        )}
                    </div>
                </div>

                {/* Mobile Actions - Only essential buttons */}
                <div className="flex md:hidden items-center space-x-2">
                    <button
                        onClick={onSave}
                        className="flex items-center h-8 px-3 py-0 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        <Save className="h-4 w-4 mr-1" />
                        {dict.drawing?.save || 'Save'}
                    </button>

                    <button
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={toggleMobileMenu}
                        title="Menu">
                        <Menu className="h-5 w-5 text-slate-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-3">
                    <button
                        onClick={onSave}
                        className="flex items-center h-9 px-3 py-0 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                        <Save className="h-4 w-4 mr-1.5" />
                        {dict.drawing?.save || 'Save'}
                    </button>

                    <button
                        onClick={onSaveAsTemplate}
                        className="flex items-center h-9 px-3 py-0 border border-amber-200 dark:border-amber-700 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                        title="Save current canvas as a reusable template">
                        <Bookmark className="h-4 w-4 mr-1.5" />
                        Save as Template
                    </button>

                    {/* Desktop Social Share */}
                    <SocialShare
                        onDownload={handleDownload}
                        canvasName={
                            canvasName ||
                            dict.drawing?.untitledDesign ||
                            'Untitled Design'
                        }
                        canvasDescription={canvasDescription}
                    />

                    <div className="relative flex items-center">
                        <button
                            onClick={() =>
                                onDownload({
                                    format: downloadFormat,
                                    quality:
                                        downloadFormat === 'jpeg'
                                            ? 0.8
                                            : undefined,
                                    pixelRatio: 2,
                                })
                            }
                            className="flex items-center h-9 px-3 py-0 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Download className="h-4 w-4 mr-1.5" />
                            {dict.drawing?.download || 'Download'}
                        </button>
                        <select
                            value={downloadFormat}
                            onChange={e =>
                                setDownloadFormat(
                                    e.target.value as 'png' | 'jpeg' | 'pdf',
                                )
                            }
                            className="h-9 px-2 py-0 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors appearance-none cursor-pointer ml-2">
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Description Section */}
            <div className="ml-11 max-w-md">
                {isEditingDescription ? (
                    <textarea
                        ref={descriptionInputRef}
                        value={descriptionInput}
                        onChange={handleDescriptionChange}
                        onBlur={stopEditingDescription}
                        onKeyDown={handleDescriptionKeyDown}
                        placeholder="Add a description..."
                        className="w-full text-sm text-slate-600 dark:text-gray-400 bg-transparent border border-indigo-300 dark:border-indigo-600 rounded px-2 py-1 focus:outline-none focus:border-indigo-500 resize-none"
                        rows={2}
                    />
                ) : (
                    <div
                        className="flex items-center group cursor-pointer"
                        onClick={startEditingDescription}>
                        <p
                            className="text-sm text-slate-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-relaxed"
                            title="Click to edit description">
                            {canvasDescription || 'Add a description...'}
                        </p>
                        <Edit3 className="h-3 w-3 text-slate-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                    </div>
                )}
                {isEditingDescription && (
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                        Press Ctrl+Enter to save, Escape to cancel
                    </p>
                )}
            </div>
        </header>
    );
};

export default CanvasHeader;
