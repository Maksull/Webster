'use client';

import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { useDrawing } from '@/contexts';
import { ToolType } from '@/types/elements';

interface ToolButtonProps {
    tool: ToolType;
    icon: LucideIcon;
    title: string;
    onClick?: () => void;
}

// forwardRef to allow parent to attach a ref to the button
const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
    ({ tool: toolName, icon: Icon, title, onClick }, ref) => {
        const { tool, setTool } = useDrawing();

        const handleClick = () => {
            setTool(toolName);
            if (onClick) onClick();
        };

        const isActive = tool === toolName;

        return (
            <button
                ref={ref}
                className={`cursor-pointer p-2 rounded-lg transition-colors duration-200 ${
                    isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                }`}
                onClick={handleClick}
                title={title}>
                <Icon className="h-5 w-5" />
            </button>
        );
    },
);

ToolButton.displayName = 'ToolButton';

export default ToolButton;
