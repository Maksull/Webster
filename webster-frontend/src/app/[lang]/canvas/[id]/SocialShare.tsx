'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Share2,
    Facebook,
    Twitter,
    Linkedin,
    Copy,
    ExternalLink,
} from 'lucide-react';
import { useDrawing } from '@/contexts/DrawingContext';

interface SocialShareProps {
    onDownload: (options: {
        format: 'png' | 'jpeg' | 'pdf';
        quality?: number;
        pixelRatio?: number;
    }) => Promise<string | void>;
    canvasName: string;
    canvasDescription: string | null;
}

const SocialShare: React.FC<SocialShareProps> = ({
    canvasName,
    canvasDescription,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { stageRef } = useDrawing();

    // Check if Web Share API is supported
    const isWebShareSupported =
        typeof navigator !== 'undefined' &&
        'share' in navigator &&
        typeof navigator.share === 'function';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const generateAndCopyImage = async (): Promise<Blob | null> => {
        try {
            setIsSharing(true);
            if (!stageRef.current) {
                console.error('Stage reference not available');
                return null;
            }

            const dataURL = stageRef.current.toDataURL({
                mimeType: 'image/png',
                quality: 0.9,
                pixelRatio: 2,
            });

            const response = await fetch(dataURL);
            const blob = await response.blob();

            if (navigator.clipboard && window.ClipboardItem) {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob }),
                    ]);
                    console.log('Image copied to clipboard successfully');
                } catch (clipboardError) {
                    console.warn(
                        'Failed to copy image to clipboard:',
                        clipboardError,
                    );
                    await copyTextToClipboard();
                }
            } else {
                console.warn(
                    'Clipboard API not supported, copying text instead',
                );
                await copyTextToClipboard();
            }

            return blob;
        } catch (error) {
            console.error('Error generating and copying image:', error);
            await copyTextToClipboard();
            return null;
        } finally {
            setIsSharing(false);
        }
    };

    const copyTextToClipboard = async () => {
        try {
            const shareText = `Check out my design: ${canvasName}${
                canvasDescription ? ` - ${canvasDescription}` : ''
            }\n${window.location.href}`;
            await navigator.clipboard.writeText(shareText);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('Failed to copy text to clipboard:', error);
        }
    };

    const handleShare = async (platform: string) => {
        await generateAndCopyImage();

        const shareText = `Check out my design: ${canvasName}${
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

        if (platform === 'native' && isWebShareSupported) {
            try {
                const shareData: ShareData = {
                    title: canvasName,
                    text: shareText,
                    url: shareUrl,
                };
                await navigator.share(shareData);
                setIsOpen(false);
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
            setIsOpen(false);
        }
    };

    const copyToClipboard = async () => {
        await copyTextToClipboard();
    };

    const copyImageOnly = async () => {
        await generateAndCopyImage();
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center h-9 px-3 py-0 border border-slate-200 dark:border-gray-700 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSharing}>
                <Share2 className="h-4 w-4 mr-1.5" />
                {isSharing ? 'Preparing...' : 'Share'}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-slate-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                            Share your design
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            {canvasName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                            Image will be copied to clipboard
                        </p>
                    </div>

                    <div className="p-2">
                        {/* Native Share */}
                        {isWebShareSupported && (
                            <button
                                onClick={() => handleShare('native')}
                                className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                disabled={isSharing}>
                                <ExternalLink className="h-4 w-4 mr-3 text-slate-500" />
                                Share via...
                            </button>
                        )}

                        {/* Social Media Buttons */}
                        <button
                            onClick={() => handleShare('facebook')}
                            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            disabled={isSharing}>
                            <Facebook className="h-4 w-4 mr-3 text-blue-600" />
                            Facebook
                        </button>

                        <button
                            onClick={() => handleShare('twitter')}
                            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            disabled={isSharing}>
                            <Twitter className="h-4 w-4 mr-3 text-blue-400" />
                            Twitter
                        </button>

                        <button
                            onClick={() => handleShare('linkedin')}
                            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            disabled={isSharing}>
                            <Linkedin className="h-4 w-4 mr-3 text-blue-700" />
                            LinkedIn
                        </button>

                        <button
                            onClick={() => handleShare('pinterest')}
                            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            disabled={isSharing}>
                            <div className="h-4 w-4 mr-3 bg-red-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                    P
                                </span>
                            </div>
                            Pinterest
                        </button>

                        <div className="border-t border-slate-200 dark:border-gray-700 my-2"></div>

                        {/* Copy Options */}
                        <button
                            onClick={copyImageOnly}
                            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            disabled={isSharing}>
                            <Copy className="h-4 w-4 mr-3 text-green-500" />
                            {copySuccess ? 'Image Copied!' : 'Copy Image'}
                        </button>

                        <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                            <Copy className="h-4 w-4 mr-3 text-slate-500" />
                            {copySuccess ? 'Link Copied!' : 'Copy Link'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialShare;
