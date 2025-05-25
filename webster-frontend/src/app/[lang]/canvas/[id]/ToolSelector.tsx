'use client';

import React, { useState } from 'react';
import { Pencil, Highlighter, Brush, PenLine, LucideIcon } from 'lucide-react';
import ToolButton from './ToolButton';
import { ToolType } from '@/types/elements';

interface ToolSelectorProps {
    dict: Record<string, any>;
    activeTool: ToolType;
    onSelect: (tool: ToolType) => void;
}

const tools: {
    tool: ToolType;
    icon: LucideIcon;
    titleKey: keyof NonNullable<ToolSelectorProps['dict']['drawing']>;
}[] = [
    { tool: 'pencil', icon: Pencil, titleKey: 'pencil' },
    { tool: 'marker', icon: Highlighter, titleKey: 'marker' },
    { tool: 'brush', icon: Brush, titleKey: 'brush' },
    { tool: 'pen', icon: PenLine, titleKey: 'pen' },
];

const ToolSelector: React.FC<ToolSelectorProps> = ({
    dict,
    activeTool,
    onSelect,
}) => {
    const [open, setOpen] = useState(false);

    // Only consider valid tools
    const validTool = tools.find(t => t.tool === activeTool) ?? tools[0];
    const ActiveIcon = validTool.icon;

    const handleSelect = (selectedTool: ToolType) => {
        onSelect(selectedTool);
        setOpen(false);
    };

    return (
        <div className="relative">
            <ToolButton
                tool={validTool.tool}
                icon={ActiveIcon}
                title={dict.drawing?.[validTool.titleKey] || validTool.titleKey}
                onClick={() => setOpen(prev => !prev)}
            />

            {open && (
                <div className="absolute left-full top-0 ml-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md z-10">
                    <div className="flex flex-row">
                        {tools.map(({ tool: t, icon, titleKey }) => (
                            <ToolButton
                                key={t}
                                tool={t}
                                icon={icon}
                                title={dict.drawing?.[titleKey] || titleKey}
                                onClick={() => handleSelect(t)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToolSelector;
