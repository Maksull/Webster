'use client';

import React from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useDrawing, DrawingProvider } from '@/contexts/DrawingContext';
import Header from './Header';
import Canvas from './Canvas';
import DesktopToolbar from './DesktopToolbar';
import LayerPanel from './LayerPanel';
import MobileMenu from './MobileMenu';
import MobileToolbar from './MobileToolbar';
import SettingsPanel from './SettingsPanel';
import { useCanvasOperations } from './useCanvasOperations';
import { useHistory } from './useHistory';
import ZoomControls from './ZoomControls';

const DrawingEditorContent: React.FC = () => {
    const { dict, lang } = useDictionary();
    const { showLayersPanel, isMobileMenuOpen } = useDrawing();

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
            {/* Header */}
            <Header
                dict={dict}
                lang={lang}
                onSave={handleSave}
                onDownload={handleDownload}
            />

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <MobileMenu
                    dict={dict}
                    onSave={handleSave}
                    onDownload={handleDownload}
                    onClear={handleClear}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Desktop Toolbar */}
                <DesktopToolbar dict={dict} onClear={handleClear} />

                {/* Canvas */}
                <Canvas
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onResizeStart={handleResizeStart}
                />
            </div>

            {/* Mobile toolbar at bottom */}
            <MobileToolbar dict={dict} />

            {/* Settings Panel */}
            <SettingsPanel
                dict={dict}
                onResolutionChange={handleResolutionChange}
            />

            {/* Layers Panel */}
            {showLayersPanel && <LayerPanel dict={dict} />}

            {/* Floating zoom controls for mobile */}
            <ZoomControls showOnMobile={true} />
        </div>
    );
};

// Wrap the component with the DrawingProvider
const DrawingEditor: React.FC = () => {
    return (
        <DrawingProvider>
            <DrawingEditorContent />
        </DrawingProvider>
    );
};

export default DrawingEditor;
