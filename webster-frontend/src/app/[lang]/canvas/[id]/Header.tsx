'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, Save, Download } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useDrawing } from '@/contexts/DrawingContext';

interface HeaderProps {
    dict: Dictionary;
    lang: string;
    onSave: () => void;
    onDownload: () => void;
}

const Header: React.FC<HeaderProps> = ({ dict, lang, onSave, onDownload }) => {
    const { setIsMobileMenuOpen, canvasName, setCanvasName } = useDrawing();

    const [isEditing, setIsEditing] = useState(false);
    const [nameInput, setNameInput] = useState(
        canvasName || dict.drawing?.untitledDesign || 'Untitled Design',
    );
    const inputRef = useRef<HTMLInputElement>(null);

    // Update local state when canvas name changes from context
    useEffect(() => {
        setNameInput(
            canvasName || dict.drawing?.untitledDesign || 'Untitled Design',
        );
    }, [canvasName, dict.drawing?.untitledDesign]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prevState => !prevState);
    };

    const startEditing = () => {
        setIsEditing(true);
    };

    const stopEditing = () => {
        setIsEditing(false);
        if (nameInput.trim() === '') {
            setNameInput(dict.drawing?.untitledDesign || 'Untitled Design');
        } else {
            setCanvasName(nameInput);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameInput(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            stopEditing();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setNameInput(
                canvasName || dict.drawing?.untitledDesign || 'Untitled Design',
            );
        }
    };

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    return (
        <header className="h-14 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-4 flex items-center justify-between z-10">
            <div className="flex items-center">
                <Link
                    href={`/${lang}/account`}
                    className="mr-3 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                    title={dict.drawing?.back || 'Back'}>
                    <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-gray-300" />
                </Link>

                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={nameInput}
                        onChange={handleNameChange}
                        onBlur={stopEditing}
                        onKeyDown={handleKeyDown}
                        className="text-lg font-medium text-slate-800 dark:text-white bg-transparent border-b border-indigo-500 focus:outline-none px-1 max-w-[200px] md:max-w-xs"
                    />
                ) : (
                    <h1
                        className="text-lg font-medium text-slate-800 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        onClick={startEditing}
                        title={dict.drawing?.editName || 'Click to edit name'}>
                        {canvasName ||
                            dict.drawing?.untitledDesign ||
                            'Untitled Design'}
                    </h1>
                )}
            </div>

            <button
                className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                onClick={toggleMobileMenu}>
                <Menu className="h-5 w-5 text-slate-600 dark:text-gray-300" />
            </button>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center space-x-3">
                <button
                    onClick={onSave}
                    className="flex items-center h-9 px-3 py-0 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors">
                    <Save className="h-4 w-4 mr-1.5" />
                    {dict.drawing?.save || 'Save'}
                </button>
                <button
                    onClick={onDownload}
                    className="flex items-center h-9 px-3 py-0 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <Download className="h-4 w-4 mr-1.5" />
                    {dict.drawing?.download || 'Download'}
                </button>
            </div>
        </header>
    );
};

export default Header;
