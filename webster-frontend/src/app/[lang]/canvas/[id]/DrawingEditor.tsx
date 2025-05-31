'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
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
import TemplateCreationModal from './TemplateCreationModal';
import { Canvas as CanvasType } from '@/types/canvas';
import { DrawingProvider, useDrawing } from '@/contexts';
import AlertModal from '@/components/AlertModal';
import { API_URL } from '@/config';

interface DrawingEditorProps {
    initialCanvas?: CanvasType | null;
}

const DrawingEditorContent: React.FC = () => {
    const { dict, lang } = useDictionary();
    const { isAuthenticated } = useAuth();
    const { showLayersPanel, isMobileMenuOpen, canvasId, canvasName } =
        useDrawing();
    const { handleClear } = useHistory();
    const [modal, setModal] = useState({
        open: false,
        type: 'success' as 'success' | 'error',
        message: '',
    });
    const [templateModal, setTemplateModal] = useState(false);

    const notify = (type: 'success' | 'error', message: string) => {
        setModal({ open: true, type, message });
    };

    const handleSaveWithNotify = async () => {
        const result = await handleSave();
        notify(result.success ? 'success' : 'error', result.message);
    };

    const handleSaveAsTemplate = async (templateData: {
        name: string;
        description?: string;
    }) => {
        if (!canvasId) {
            throw new Error('Canvas must be saved before creating a template');
        }

        try {
            const saveResult = await handleSave();
            if (!saveResult.success) {
                throw new Error(
                    'Please save the canvas first before creating a template',
                );
            }

            const response = await fetch(
                `${API_URL}/templates/from-canvas/${canvasId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: JSON.stringify({
                        ...templateData,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || 'Failed to create template',
                );
            }

            const result = await response.json();
            console.log('Template created successfully:', result);
            notify(
                'success',
                `Template "${templateData.name}" created successfully!`,
            );
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    };

    const openTemplateModal = () => {
        if (!isAuthenticated) {
            notify(
                'error',
                'Please sign in to create templates. Templates allow you to save your designs.',
            );
            return;
        }

        if (!canvasId) {
            notify(
                'error',
                'Please save your canvas first before creating a template',
            );
            return;
        }

        setTemplateModal(true);
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

    const {
        getActiveLayerElements,
        selectedElementIds,
        updateActiveLayerElements,
        elementsByLayer,
        textEditingId,
    } = useDrawing();

    const selectedIdsRef = useRef<string[]>([]);

    useEffect(() => {
        selectedIdsRef.current = selectedElementIds;
    }, [selectedElementIds]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if text editor is open - if so, don't process movement
            if (textEditingId) {
                return;
            }

            const selectedIds = selectedIdsRef.current;
            const ARROW_KEYS = [
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
            ];
            const key = ARROW_KEYS.includes(e.key)
                ? e.key
                : e.key.toLowerCase();
            const movementStep = e.shiftKey ? 10 : 5;

            const directionMap: Record<string, { x: number; y: number }> = {
                ArrowUp: { x: 0, y: -movementStep },
                ArrowDown: { x: 0, y: movementStep },
                ArrowLeft: { x: -movementStep, y: 0 },
                ArrowRight: { x: movementStep, y: 0 },
                w: { x: 0, y: -movementStep },
                s: { x: 0, y: movementStep },
                a: { x: -movementStep, y: 0 },
                d: { x: movementStep, y: 0 },
                ц: { x: 0, y: -movementStep },
                ы: { x: 0, y: movementStep },
                і: { x: 0, y: movementStep },
                ф: { x: -movementStep, y: 0 },
                в: { x: movementStep, y: 0 },
            };

            const direction = directionMap[key];
            if (!direction) return;

            const activeElements = getActiveLayerElements();
            const updatedElements = activeElements.map(el => {
                if (!selectedIds.includes(el.id)) return el;

                switch (el.type) {
                    case 'rectangle':
                    case 'circle':
                    case 'triangle':
                    case 'text':
                    case 'image':
                        return {
                            ...el,
                            x: el.x + direction.x,
                            y: el.y + direction.y,
                        };
                    case 'arrow':
                    case 'line-shape':
                    case 'line':
                        return {
                            ...el,
                            points: el.points.map((val, idx) =>
                                idx % 2 === 0
                                    ? val + direction.x
                                    : val + direction.y,
                            ),
                        };
                    default:
                        return el;
                }
            });

            updateActiveLayerElements(updatedElements);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedElementIds, elementsByLayer, textEditingId]);

    // Create a wrapper for handleDownload that returns a Promise<string | void>
    const handleDownloadWrapper = async (options: {
        format: 'png' | 'jpeg' | 'pdf';
        quality?: number;
        pixelRatio?: number;
    }): Promise<string | void> => {
        return new Promise(resolve => {
            handleDownload(options);
            resolve(undefined); // or return a string if your download function generates a URL
        });
    };

    return (
        <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-gray-900 overflow-hidden">
            <AlertModal
                open={modal.open}
                type={modal.type}
                message={modal.message}
                onClose={() => setModal({ ...modal, open: false })}
            />

            <TemplateCreationModal
                isOpen={templateModal}
                onClose={() => setTemplateModal(false)}
                onSave={handleSaveAsTemplate}
                defaultName={
                    canvasName ? `${canvasName} Template` : 'My Template'
                }
            />

            <CanvasHeader
                dict={dict}
                lang={lang}
                onSave={handleSaveWithNotify}
                onDownload={handleDownloadWrapper}
                onSaveAsTemplate={openTemplateModal}
            />

            {isMobileMenuOpen && (
                <MobileMenu
                    dict={dict}
                    onSave={handleSaveWithNotify}
                    onDownload={handleDownloadWrapper}
                    onClear={handleClear}
                    onSaveAsTemplate={openTemplateModal}
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
