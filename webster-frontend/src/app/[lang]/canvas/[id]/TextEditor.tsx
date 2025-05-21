'use client';

import React, { useEffect, useRef } from 'react';

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onDone: () => void;
    position: { x: number; y: number };
}

const TextEditor: React.FC<TextEditorProps> = ({
    value,
    onChange,
    onDone,
    position,
}) => {
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onDone();
        }
        if (e.key === 'Escape') {
            onDone();
        }
    };

    return (
        <div
            className="absolute z-30 bg-white dark:bg-gray-800 border border-indigo-500 shadow-lg"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-32%, -130%)',
            }}>
            <textarea
                ref={inputRef}
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onDone}
                className="w-full p-2 focus:outline-none resize-both dark:bg-gray-800 dark:text-white"
                style={{ minWidth: '200px', minHeight: '60px' }}
            />
        </div>
    );
};

export default TextEditor;
