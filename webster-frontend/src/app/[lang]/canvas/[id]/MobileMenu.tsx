// app/[lang]/editor/components/toolbar/MobileMenu.tsx
'use client';

import React from 'react';
import {
    X,
    Eraser,
    Droplet,
    Square,
    Circle as CircleIcon,
    Minus,
    Triangle as TriangleIcon,
    Layers,
    Palette,
    Undo,
    Redo,
    Trash2,
    ZoomIn,
    ZoomOut,
    Save,
    Download,
    Type,
    ArrowUpRight,
    Bookmark,
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Copy,
    ExternalLink,
} from 'lucide-react';
import { Dictionary } from '@/get-dictionary';
import { useHistory } from './useHistory';
import { useDrawing } from '@/contexts';

interface MobileMenuProps {
    dict: Dictionary;
    onSave: () => void;
    onDownload: (options: {
        format: 'png' | 'jpeg' | 'pdf';
        quality?: number;
        pixelRatio?: number;
    }) => Promise<string | void>;
    onClear: () => void;
    onSaveAsTemplate: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    dict,
    onSave,
    onDownload,
    onClear,
    onSaveAsTemplate,
}) => {
    const {
        tool,
        setTool,
        showLayersPanel,
        setShowLayersPanel,
        setShowSettings,
        scale,
        setScale,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        canvasName,
        canvasDescription,
        stageRef,
    } = useDrawing();
    const { handleUndo, handleRedo, canUndo, canRedo } = useHistory();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleDownloadPNG = () => {
        onDownload({
            format: 'png',
            quality: 1,
            pixelRatio: 2,
        });
        toggleMobileMenu();
    };

    const handleDownloadJPEG = () => {
        onDownload({
            format: 'jpeg',
            quality: 0.8,
            pixelRatio: 2,
        });
        toggleMobileMenu();
    };

    const handleDownloadPDF = () => {
        onDownload({
            format: 'pdf',
            pixelRatio: 2,
        });
        toggleMobileMenu();
    };

    // Share functionality
    const handleShare = async (platform: string) => {
        const shareText = `Check out my design: ${canvasName || 'My Design'}${
            canvasDescription ? ` - ${canvasDescription}` : ''
        }`;
        const shareUrl = window.location.href;

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl,
            )}&quote=${encodeURIComponent(shareText)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                shareText,
            )}&url=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                shareUrl,
            )}&summary=${encodeURIComponent(shareText)}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
                shareUrl,
            )}&description=${encodeURIComponent(shareText)}`,
        };

        if (platform === 'native' && navigator.share) {
            try {
                const shareData: ShareData = {
                    title: canvasName || 'My Design',
                    text: shareText,
                    url: shareUrl,
                };
                await navigator.share(shareData);
                toggleMobileMenu();
                return;
            } catch (error) {
                console.warn('Native sharing failed:', error);
                platform = 'twitter';
            }
        }

        if (shareUrls[platform as keyof typeof shareUrls]) {
            window.open(
                shareUrls[platform as keyof typeof shareUrls],
                'share-window',
                'width=600,height=400,scrollbars=yes,resizable=yes',
            );
            toggleMobileMenu();
        }
    };

    const copyToClipboard = async () => {
        try {
            const shareText = `Check out my design: ${canvasName || 'My Design'}${
                canvasDescription ? ` - ${canvasDescription}` : ''
            }\n${window.location.href}`;
            await navigator.clipboard.writeText(shareText);
            // You might want to show a toast notification here
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const copyImageToClipboard = async () => {
        try {
            if (!stageRef?.current) {
                console.error('Stage reference not available');
                return;
            }
            const dataURL = stageRef.current.toDataURL({
                format: 'png',
                quality: 0.9,
                pixelRatio: 2,
            });
            const response = await fetch(dataURL);
            const blob = await response.blob();

            if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob }),
                ]);
            }
        } catch (error) {
            console.error('Failed to copy image to clipboard:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={toggleMobileMenu}></div>
            <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl p-4 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                        Tools & Actions
                    </h3>
                    <button onClick={toggleMobileMenu}>
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {/* Drawing Tools */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Drawing Tools
                        </h4>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'select'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('select');
                                toggleMobileMenu();
                            }}>
                            <svg
                                className="h-5 w-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                />
                            </svg>
                            Select
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'brush'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('brush');
                                toggleMobileMenu();
                            }}>
                            <svg
                                className="h-5 w-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                            </svg>
                            Brush
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'pen'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('pen');
                                toggleMobileMenu();
                            }}>
                            <svg
                                className="h-5 w-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                            Pen
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'pencil'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('pencil');
                                toggleMobileMenu();
                            }}>
                            <svg
                                className="h-5 w-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                            </svg>
                            Pencil
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'eraser'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('eraser');
                                toggleMobileMenu();
                            }}>
                            <Eraser className="h-5 w-5 mr-2" />
                            Eraser
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'bucket'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('bucket');
                                toggleMobileMenu();
                            }}>
                            <Droplet className="h-5 w-5 mr-2" />
                            Fill
                        </button>
                    </div>

                    {/* Shape Tools */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Shapes
                        </h4>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'rectangle'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('rectangle');
                                toggleMobileMenu();
                            }}>
                            <Square className="h-5 w-5 mr-2" />
                            Rectangle
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'circle'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('circle');
                                toggleMobileMenu();
                            }}>
                            <CircleIcon className="h-5 w-5 mr-2" />
                            Circle
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'triangle'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('triangle');
                                toggleMobileMenu();
                            }}>
                            <TriangleIcon className="h-5 w-5 mr-2" />
                            Triangle
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'line'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('line');
                                toggleMobileMenu();
                            }}>
                            <Minus className="h-5 w-5 mr-2" />
                            Line
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'arrow'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('arrow');
                                toggleMobileMenu();
                            }}>
                            <ArrowUpRight className="h-5 w-5 mr-2" />
                            Arrow
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg w-full ${
                                tool === 'text'
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool('text');
                                toggleMobileMenu();
                            }}>
                            <Type className="h-5 w-5 mr-2" />
                            Text
                        </button>
                    </div>

                    {/* View Controls */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            View & Settings
                        </h4>
                        <button
                            className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full"
                            onClick={() => {
                                setShowLayersPanel(!showLayersPanel);
                                toggleMobileMenu();
                            }}>
                            <Layers className="h-5 w-5 mr-2" />
                            Layers
                        </button>
                        <button
                            className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full"
                            onClick={() => {
                                setShowSettings(true);
                                toggleMobileMenu();
                            }}>
                            <Palette className="h-5 w-5 mr-2" />
                            Color & Size
                        </button>
                    </div>

                    {/* History Controls */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            History
                        </h4>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full ${
                                !canUndo ? 'opacity-50' : ''
                            }`}
                            onClick={handleUndo}
                            disabled={!canUndo}>
                            <Undo className="h-5 w-5 mr-2" />
                            Undo
                        </button>
                        <button
                            className={`flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full ${
                                !canRedo ? 'opacity-50' : ''
                            }`}
                            onClick={handleRedo}
                            disabled={!canRedo}>
                            <Redo className="h-5 w-5 mr-2" />
                            Redo
                        </button>
                        <button
                            className="flex items-center px-3 py-2 rounded-lg text-red-500 w-full"
                            onClick={() => {
                                onClear();
                                toggleMobileMenu();
                            }}>
                            <Trash2 className="h-5 w-5 mr-2" />
                            Clear Canvas
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <div className="flex justify-between items-center px-3 py-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Zoom
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    onClick={() =>
                                        setScale(prevScale =>
                                            Math.max(prevScale - 0.1, 0.5),
                                        )
                                    }>
                                    <ZoomOut className="h-4 w-4" />
                                </button>
                                <button
                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    onClick={() => setScale(1)}>
                                    <span className="text-xs font-medium">
                                        {Math.round(scale * 100)}%
                                    </span>
                                </button>
                                <button
                                    className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    onClick={() =>
                                        setScale(prevScale =>
                                            Math.min(prevScale + 0.1, 3),
                                        )
                                    }>
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Share Section */}
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Share Your Design
                        </h4>

                        {/* Native Share (if available) */}
                        {navigator.share && (
                            <button
                                onClick={() => handleShare('native')}
                                className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ExternalLink className="h-4 w-4 mr-3 text-slate-500" />
                                Share via...
                            </button>
                        )}

                        {/* Social Media Buttons */}
                        <button
                            onClick={() => handleShare('facebook')}
                            className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                            Facebook
                        </button>

                        <button
                            onClick={() => handleShare('twitter')}
                            className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                            Twitter
                        </button>

                        <button
                            onClick={() => handleShare('linkedin')}
                            className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
                            LinkedIn
                        </button>

                        <button
                            onClick={() => handleShare('pinterest')}
                            className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="h-4 w-4 mr-3 bg-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    P
                                </span>
                            </div>
                            Pinterest
                        </button>

                        {/* Copy Options */}
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={copyImageToClipboard}
                                className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Copy className="h-4 w-4 mr-3 text-green-500" />
                                Copy Image
                            </button>

                            <button
                                onClick={copyToClipboard}
                                className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 w-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <Copy className="h-4 w-4 mr-3 text-slate-500" />
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons at Bottom */}
                <div className="mt-auto pt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Save & Export
                    </h4>

                    {/* Save Button */}
                    <button
                        onClick={() => {
                            onSave();
                            toggleMobileMenu();
                        }}
                        className="w-full flex items-center justify-center h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Save className="h-4 w-4 mr-1.5" />
                        {dict.drawing?.save || 'Save'}
                    </button>

                    {/* Save as Template Button */}
                    <button
                        onClick={() => {
                            onSaveAsTemplate();
                            toggleMobileMenu();
                        }}
                        className="w-full flex items-center justify-center h-10 px-3 border border-amber-200 dark:border-amber-700 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                        <Bookmark className="h-4 w-4 mr-1.5" />
                        Save as Template
                    </button>

                    {/* Download Options */}
                    <div className="space-y-1">
                        <button
                            onClick={handleDownloadPNG}
                            className="w-full flex items-center justify-center h-10 px-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                            <Download className="h-4 w-4 mr-1.5" />
                            Download PNG
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={handleDownloadJPEG}
                                className="flex items-center justify-center h-9 px-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <Download className="h-3 w-3 mr-1" />
                                JPEG
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center justify-center h-9 px-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
