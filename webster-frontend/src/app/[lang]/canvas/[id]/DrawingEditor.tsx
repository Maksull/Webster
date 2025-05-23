'use client';

import React, { useState } from 'react';
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
import AlertModal from '@/components/AlertModal';

interface DrawingEditorProps {
    initialCanvas?: CanvasType | null;
}

const DrawingEditorContent: React.FC = () => {
    const { dict, lang } = useDictionary();
    const { showLayersPanel, isMobileMenuOpen } = useDrawing();
    const { handleClear } = useHistory();
    const [modal, setModal] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        message: '',
    });

    const notify = (type: 'success' | 'error', message: string) => {
        setModal({ open: true, type, message });
    };

    const handleSaveWithNotify = async () => {
        const result = await handleSave();
        notify(result.success ? 'success' : 'error', result.message);
    };

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
            <AlertModal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />

            <CanvasHeader
                dict={dict}
                lang={lang}
                onSave={handleSaveWithNotify}
                onDownload={handleDownload}
            />

            {isMobileMenuOpen && (
                <MobileMenu
                    dict={dict}
                    onSave={handleSaveWithNotify}
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

            <MobileToolbar />
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
