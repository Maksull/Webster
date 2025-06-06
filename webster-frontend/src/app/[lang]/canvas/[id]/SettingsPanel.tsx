'use client';
import React from 'react';
import { X } from 'lucide-react';
import ResolutionSelector from './ResolutionSelector';
import ColorPicker from './ColorPicker';
import StrokeWidthControl from './StrokeWidthControl';
import ShapeFillControl from './ShapeFillControl';
import SelectedObjectColorPicker from './SelectedObjectColorPicker';
import { Dictionary } from '@/get-dictionary';
import { Resolution } from '@/types/elements';
import { useDrawing } from '@/contexts';
import BackgroundTransparencyControl from './BackgroundTransparencyControl';

interface SettingsPanelProps {
    dict: Dictionary;
    onResolutionChange: (resolution: Resolution) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    dict,
    onResolutionChange,
}) => {
    const {
        showSettings,
        setShowSettings,
        setTextFontSize,
        setTextFontFamily,
        textFontSize,
        textFontFamily,
        selectedElementIds,
    } = useDrawing();

    if (!showSettings) return null;

    return (
        <div className="fixed right-4 top-16 md:right-6 md:top-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 w-72 border border-slate-200 dark:border-gray-700 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                        {dict.drawing?.toolSettings || 'Tool Settings'}
                    </h3>
                    <button
                        className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                        onClick={() => setShowSettings(false)}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="space-y-6">
                    {/* Selected Object Colors - Show when objects are selected */}
                    {selectedElementIds.length > 0 && (
                        <div className="pb-4 border-b border-slate-200 dark:border-gray-700">
                            <SelectedObjectColorPicker dict={dict} />
                        </div>
                    )}

                    {/* Canvas Resolution */}
                    <div>
                        <ResolutionSelector
                            dict={dict}
                            onResolutionChange={onResolutionChange}
                        />
                    </div>

                    {/* Text Styles */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-gray-300">
                            {dict.drawing?.textStyles || 'Text Styles'}
                        </h4>

                        {/* Font Size */}
                        <div>
                            <label className="text-xs text-slate-500 dark:text-gray-400">
                                {dict.drawing?.fontSize || 'Font Size'}
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="72"
                                value={textFontSize}
                                onChange={e =>
                                    setTextFontSize(Number(e.target.value))
                                }
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>8px</span>
                                <span>{textFontSize}px</span>
                                <span>72px</span>
                            </div>
                        </div>

                        {/* Font Family */}
                        <div>
                            <label className="text-xs text-slate-500 dark:text-gray-400">
                                {dict.drawing?.fontFamily || 'Font Family'}
                            </label>
                            <select
                                value={textFontFamily}
                                onChange={e =>
                                    setTextFontFamily(e.target.value)
                                }
                                className="w-full p-1 text-sm border border-slate-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">
                                    Times New Roman
                                </option>
                                <option value="Courier New">Courier New</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Verdana">Verdana</option>
                            </select>
                        </div>
                    </div>

                    {/* Drawing Tools */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-gray-300">
                            {dict.drawing?.drawingTools || 'Drawing Tools'}
                        </h4>

                        {/* Stroke Width */}
                        <StrokeWidthControl dict={dict} />

                        {/* Brush/Pen Color */}
                        <ColorPicker dict={dict} />

                        {/* Shape Fill */}
                        <ShapeFillControl />
                    </div>

                    {/* Canvas Settings */}
                    <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-3">
                            {dict.drawing?.canvasSettings || 'Canvas Settings'}
                        </h4>
                        <BackgroundTransparencyControl dict={dict} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
