'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Type, Palette, ChevronDown } from 'lucide-react';
import { useDictionary } from '@/contexts';

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onDone: () => void;
    position: { x: number; y: number };
    // Add styling props
    fontSize: number;
    onFontSizeChange: (size: number) => void;
    fontFamily: string;
    onFontFamilyChange: (family: string) => void;
    color: string;
    onColorChange: (color: string) => void;
}

const FONT_FAMILIES = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Palatino',
];

const COMMON_COLORS = [
    '#000000',
    '#FFFFFF',
    '#FF0000',
    '#FF8C00',
    '#FFFF00',
    '#008000',
    '#0000FF',
    '#4B0082',
    '#800080',
    '#FFC0CB',
];

const TextEditor: React.FC<TextEditorProps> = ({
    value,
    onChange,
    onDone,
    position,
    fontSize,
    onFontSizeChange,
    fontFamily,
    onFontFamilyChange,
    color,
    onColorChange,
}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);
    const [fontSizeInput, setFontSizeInput] = useState(fontSize.toString());
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const fontPickerRef = useRef<HTMLDivElement>(null);
    const { dict } = useDictionary();

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    // Update local font size input when prop changes
    useEffect(() => {
        setFontSizeInput(fontSize.toString());
    }, [fontSize]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;

            // Handle color picker dropdown
            if (
                colorPickerRef.current &&
                !colorPickerRef.current.contains(target)
            ) {
                setShowColorPicker(false);
            }

            // Handle font picker dropdown
            if (
                fontPickerRef.current &&
                !fontPickerRef.current.contains(target)
            ) {
                setShowFontPicker(false);
            }

            // Handle clicking outside the entire text editor
            const textEditor = target.closest('[data-text-editor]');
            if (!textEditor) {
                onDone();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [onDone]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onDone();
        }
        if (e.key === 'Escape') {
            onDone();
        }
    };

    const handleFontSizeInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const inputValue = e.target.value;
        setFontSizeInput(inputValue);

        // Only update parent if it's a valid number within range
        const size = parseInt(inputValue);
        if (!isNaN(size) && size >= 8 && size <= 100) {
            onFontSizeChange(size);
        }
    };

    const handleFontSizeBlur = () => {
        const size = parseInt(fontSizeInput);
        if (isNaN(size) || size < 8 || size > 100) {
            // Reset to current valid value if invalid
            setFontSizeInput(fontSize.toString());
        }
    };

    // Prevent toolbar interactions from closing the editor (except for inputs)
    const handleToolbarMouseDown = (e: React.MouseEvent) => {
        // Don't prevent default for input elements - they need to get focus
        if ((e.target as HTMLElement).tagName !== 'INPUT') {
            e.preventDefault(); // Prevents textarea from losing focus
        }
    };

    return (
        <div
            className="absolute z-10 bg-white dark:bg-gray-800 border border-indigo-500 shadow-lg rounded-lg overflow-hidden"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-19%, -185%)',
                minWidth: '350px',
            }}
            data-text-editor>
            {/* Toolbar */}
            <div
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                onMouseDown={handleToolbarMouseDown}>
                {/* Font Size */}
                <div className="flex items-center gap-1">
                    <Type className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <input
                        type="text"
                        value={fontSizeInput}
                        onChange={handleFontSizeInputChange}
                        onBlur={handleFontSizeBlur}
                        className="w-12 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                        placeholder="16"
                    />
                </div>

                {/* Font Family */}
                <div className="relative" ref={fontPickerRef}>
                    <button
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => setShowFontPicker(!showFontPicker)}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <span className="max-w-20 truncate">{fontFamily}</span>
                        <ChevronDown className="w-3 h-3" />
                    </button>

                    {showFontPicker && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-40 overflow-y-auto z-40">
                            {FONT_FAMILIES.map(font => (
                                <button
                                    key={font}
                                    onMouseDown={handleToolbarMouseDown}
                                    onClick={() => {
                                        onFontFamilyChange(font);
                                        setShowFontPicker(false);
                                    }}
                                    style={{ fontFamily: font }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                        fontFamily === font
                                            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                                            : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {font}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Color Picker */}
                <div className="relative" ref={colorPickerRef}>
                    <button
                        onMouseDown={handleToolbarMouseDown}
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex items-center gap-x-2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <Palette className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <div
                            className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: color }}
                        />
                    </button>

                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-40 min-w-[150px]">
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {COMMON_COLORS.map(colorOption => (
                                    <button
                                        key={colorOption}
                                        onMouseDown={handleToolbarMouseDown}
                                        onClick={() => {
                                            onColorChange(colorOption);
                                            setShowColorPicker(false);
                                        }}
                                        className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform ${
                                            color === colorOption
                                                ? 'border-indigo-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        style={{ backgroundColor: colorOption }}
                                        title={colorOption}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center">
                                <label
                                    htmlFor="customColor"
                                    className="text-sm font-medium text-slate-700 dark:text-gray-300 mr-3">
                                    {dict.drawing?.custom || 'Custom'}:
                                </label>
                                <div className="relative">
                                    <input
                                        type="color"
                                        id="customColor"
                                        value={color}
                                        onChange={e =>
                                            onColorChange(e.target.value)
                                        }
                                        className="w-10 h-10 p-0 border-0 rounded-full cursor-pointer"
                                    />
                                </div>
                                <span className="ml-3 text-sm font-mono text-slate-600 dark:text-gray-400">
                                    {color.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Text Area */}
            <textarea
                ref={inputRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 focus:outline-none resize-none dark:bg-gray-800 dark:text-white text-gray-800"
                style={{
                    minWidth: '400px',
                    minHeight: '120px',
                    maxWidth: '400px',
                    maxHeight: '120px',
                    fontFamily: fontFamily,
                }}
                placeholder="Enter your text..."
            />

            {/* Footer */}
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
                Press Enter to finish, Shift+Enter for new line, Esc to cancel
            </div>
        </div>
    );
};

export default TextEditor;
