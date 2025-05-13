'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useDrawing } from '@/contexts/DrawingContext';

interface ToolButtonProps {
    tool: ToolType;
    icon: LucideIcon;
    title: string;
    onClick?: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
    tool: toolName,
    icon: Icon,
    title,
    onClick,
}) => {
    const { tool, setTool } = useDrawing();

    const handleClick = () => {
        setTool(toolName);
        if (onClick) onClick();
    };

    const isActive = tool === toolName;

    return (
        <button
            className={`p-2 rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
            }`}
            onClick={handleClick}
            title={title}>
            <Icon className="h-5 w-5" />
        </button>
    );
};

export default ToolButton;
