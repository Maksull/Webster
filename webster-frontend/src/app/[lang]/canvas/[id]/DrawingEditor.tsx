'use client';

import React from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
import CanvasHeader from './CanvasHeader';
import Canvas from './Canvas';
import DesktopToolbar from './DesktopToolbar';
import LayerPanel from './LayerPanel';
import MobileMenu from './MobileMenu';
import MobileToolbar from './MobileToolbar';
import SettingsPanel from './SettingsPanel';
import { useCanvasOperations } from './useCanvasOperations';
import { useHistory } from './useHistory';
import ZoomControls from './ZoomControls';
import { Canvas as CanvasType } from '@/types/canvas';
import { DrawingProvider, useDrawing } from '@/contexts';

interface DrawingEditorProps {
    initialCanvas?: CanvasType | null;
}

const DrawingEditorContent: React.FC = () => {
    const { dict, lang } = useDictionary();
    const {
        showLayersPanel,
        isMobileMenuOpen,
        setDimensions,
        setBackgroundColor,
        setLayers,
        setElementsByLayer,
        setActiveLayerId,
    } = useDrawing();
    const { handleClear } = useHistory();
    const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleResizeStart,
        handleResolutionChange,
        handleSave,
        handleDownload,
    } = useCanvasOperations();

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-gray-900 overflow-hidden">
            <CanvasHeader
                dict={dict}
                lang={lang}
                onSave={handleSave}
                onDownload={handleDownload}
            />

            {isMobileMenuOpen && (
                <MobileMenu
                    dict={dict}
                    onSave={handleSave}
                    onDownload={handleDownload}
                    onClear={handleClear}
                />
            )}

            <div className="flex-1 flex overflow-hidden">
                <DesktopToolbar dict={dict} onClear={handleClear} />
                <Canvas
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onResizeStart={handleResizeStart}
                />
            </div>

            <MobileToolbar dict={dict} />
            <SettingsPanel
                dict={dict}
                onResolutionChange={handleResolutionChange}
            />
            {showLayersPanel && <LayerPanel dict={dict} />}
            <ZoomControls showOnMobile={true} />
        </div>
    );
};

const DrawingEditor: React.FC<DrawingEditorProps> = ({ initialCanvas }) => {
    return (
        <DrawingProvider initialCanvas={initialCanvas}>
            <DrawingEditorContent />
        </DrawingProvider>
    );
};

export default DrawingEditor;
