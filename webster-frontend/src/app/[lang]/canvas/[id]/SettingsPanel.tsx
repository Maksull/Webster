'use client';

import React from 'react';
import {X} from 'lucide-react';
import ResolutionSelector from './ResolutionSelector';
import ColorPicker from './ColorPicker';
import StrokeWidthControl from './StrokeWidthControl';
import ShapeFillControl from './ShapeFillControl';
import {Dictionary} from '@/get-dictionary';
import {Resolution} from '@/types/elements';
import {useDrawing} from '@/contexts';
import BackgroundTransparencyControl from './BackgroundTransparencyControl';
import OpacityControl from "@/app/[lang]/canvas/[id]/OpacityControl";

interface SettingsPanelProps {
    dict: Dictionary;
    onResolutionChange: (resolution: Resolution) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
                                                         dict,
                                                         onResolutionChange,
                                                     }) => {
    const {showSettings, setShowSettings} = useDrawing();

    if (!showSettings) return null;

    return (
        <div
            className="
                fixed right-4 top-16 md:right-6 md:top-20
                bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-20 w-80
                border border-slate-200 dark:border-gray-700
                max-h-[80vh] overflow-y-auto overflow-x-hidden
                scrollbar-hide
              "
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
                    {dict.drawing?.toolSettings || 'Tool Settings'}
                </h3>
                <button
                    className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700"
                    onClick={() => setShowSettings(false)}>
                    <X className="h-4 w-4"/>
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <ResolutionSelector
                        dict={dict}
                        onResolutionChange={onResolutionChange}
                    />
                    <StrokeWidthControl dict={dict}/>
                </div>
                <ColorPicker dict={dict}/>
                <OpacityControl dict={dict}/>
                <ShapeFillControl/>
                <BackgroundTransparencyControl dict={dict}/>
            </div>
        </div>
    );
};

export default SettingsPanel;
