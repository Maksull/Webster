'use client';

import React, { useEffect, useRef } from 'react';
import { useDictionary, useDrawing } from '@/contexts';

interface ContextMenuProps {
    x: number;
    y: number;
    isVisible: boolean;
    onClose: () => void;
    onDeleteSelected: () => void;
    onCopyImage?: () => void;
}

interface ContextMenuItem {
    label: string;
    icon?: string;
    action: () => void;
    disabled?: boolean;
    danger?: boolean;
    separator?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    x,
    y,
    isVisible,
    onClose,
    onDeleteSelected,
    onCopyImage,
}) => {
    const { selectedElementIds } = useDrawing();
    const menuRef = useRef<HTMLDivElement>(null);
    const { dict } = useDictionary();

    const hasSelectedElements = selectedElementIds.length > 0;

    const menuItems: ContextMenuItem[] = [
        {
            label: dict.drawing.copyImage || 'Copy image',
            action: () => {
                onCopyImage?.();
                onClose();
            },
        },
        {
            label: dict.drawing.remove || 'Remove',
            action: () => {
                onDeleteSelected();
                onClose();
            },
            disabled: !hasSelectedElements,
            danger: true,
        },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isVisible, onClose]);

    const adjustedPosition = React.useMemo(() => {
        if (!isVisible || !menuRef.current) return { x, y };

        const menuWidth = 200;
        const menuHeight =
            menuItems.filter(item => !item.separator).length * 40;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = x;
        let adjustedY = y;

        if (x + menuWidth > viewportWidth) {
            adjustedX = viewportWidth - menuWidth - 10;
        }

        if (y + menuHeight > viewportHeight) {
            adjustedY = viewportHeight - menuHeight - 10;
        }

        return {
            x: Math.max(10, adjustedX),
            y: Math.max(10, adjustedY),
        };
    }, [x, y, isVisible, menuItems]);

    if (!isVisible) return null;

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[180px]"
            style={{
                left: adjustedPosition.x,
                top: adjustedPosition.y,
            }}>
            {menuItems.map((item, index) =>
                item.separator ? (
                    <div
                        key={index}
                        className="h-px bg-gray-200 dark:bg-gray-600 my-1 mx-2"
                    />
                ) : (
                    <button
                        key={index}
                        onClick={item.action}
                        disabled={item.disabled}
                        className={`
                            w-full text-left px-4 py-2 text-sm transition-colors
                            ${
                                item.disabled
                                    ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : item.danger
                                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                            ${!item.disabled && 'cursor-pointer'}
                        `}>
                        <div className="flex items-center gap-2">
                            {item.danger && (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            )}
                            {(item.label === 'Copy Image' ||
                                item.label === 'Копіювати зображення') && (
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                            )}
                            <span>{item.label}</span>
                        </div>
                    </button>
                ),
            )}
        </div>
    );
};

export default ContextMenu;
