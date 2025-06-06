import { useState } from 'react';
import {
    Pencil,
    Highlighter,
    Brush,
    Pen,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { ToolType } from '@/types/elements';

interface ToolDropdownProps {
    tool: ToolType;
    setTool: (tool: ToolType) => void;
    toggleMobileMenu?: () => void;
}

const ToolDropdown: React.FC<ToolDropdownProps> = ({
    tool,
    setTool,
    toggleMobileMenu,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const tools = [
        { key: 'pencil' as ToolType, label: 'Pencil', icon: Pencil },
        { key: 'marker' as ToolType, label: 'Marker', icon: Highlighter },
        { key: 'brush' as ToolType, label: 'Brush', icon: Brush },
        { key: 'pen' as ToolType, label: 'Pen', icon: Pen },
    ];

    const isValidTool = tools.some(t => t.key === tool);
    const safeTool = isValidTool ? tool : tools[0].key;
    const selectedTool = tools.find(t => t.key === safeTool)!;
    const SelectedIcon = selectedTool.icon;

    const triggerButtonClasses = `w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
        tool === safeTool
            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

    return (
        <div className="relative w-full">
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className={triggerButtonClasses}>
                <div className="flex items-center">
                    <SelectedIcon className="h-5 w-5 mr-2" />
                    {selectedTool.label}
                </div>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg z-50">
                    {tools.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            className={`flex w-full items-center px-4 py-2 text-sm rounded-lg transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                safeTool === key
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                            onClick={() => {
                                setTool(key);
                                if (toggleMobileMenu) {
                                    toggleMobileMenu();
                                }
                                setIsOpen(false);
                            }}>
                            <Icon className="h-4 w-4 mr-2" />
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ToolDropdown;
