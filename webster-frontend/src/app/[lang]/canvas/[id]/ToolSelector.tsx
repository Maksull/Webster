'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Pencil, Highlighter, Brush, PenLine } from 'lucide-react';
import ToolButton from './ToolButton';
import { ToolType } from '@/types/elements';
import { Dictionary } from '@/get-dictionary';

interface ToolSelectorProps {
    dict: Dictionary;
    activeTool: ToolType;
    onSelect: (tool: ToolType) => void;
}

const tools = [
    { tool: 'pencil', icon: Pencil, titleKey: 'pencil' },
    { tool: 'marker', icon: Highlighter, titleKey: 'marker' },
    { tool: 'brush', icon: Brush, titleKey: 'brush' },
    { tool: 'pen', icon: PenLine, titleKey: 'pen' },
] as const;

const ToolSelector: React.FC<ToolSelectorProps> = ({
    dict,
    activeTool,
    onSelect,
}) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const updateDropdownPosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY,
                left: rect.right + 8 + window.scrollX,
            });
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target as Node) &&
            buttonRef.current &&
            !buttonRef.current.contains(event.target as Node)
        ) {
            setOpen(false);
        }
    };

    useEffect(() => {
        if (open) {
            updateDropdownPosition();
            window.addEventListener('scroll', updateDropdownPosition, true);
            window.addEventListener('resize', updateDropdownPosition);
            window.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('scroll', updateDropdownPosition, true);
            window.removeEventListener('resize', updateDropdownPosition);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const validTool = tools.find(t => t.tool === activeTool) ?? tools[0];
    const ActiveIcon = validTool.icon;

    const handleSelect = (tool: ToolType) => {
        onSelect(tool);
        setOpen(false);
    };

    return (
        <>
            <ToolButton
                ref={buttonRef}
                tool={validTool.tool}
                icon={ActiveIcon}
                title={dict.drawing?.[validTool.titleKey] || validTool.titleKey}
                onClick={() => setOpen(prev => !prev)}
            />

            {open &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-md z-1"
                        style={{
                            position: 'absolute',
                            top: coords.top,
                            left: coords.left,
                        }}>
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
                    </div>,
                    document.body,
                )}
        </>
    );
};

export default ToolSelector;
