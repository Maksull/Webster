'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas as CanvasType } from '@/types/canvas';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { API_URL } from '@/config';

const DrawingEditor = dynamic(() => import('./DrawingEditor'), { ssr: false });

interface CanvasPageClientProps {
    id: string;
}

export default function CanvasPageClient({ id }: CanvasPageClientProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [canvas, setCanvas] = useState<CanvasType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const canvasId = id;

    const loadLocalCanvas = (): CanvasType | null => {
        try {
            const canvasData = localStorage.getItem('local_canvas_data');
            if (canvasData) {
                console.log(
                    'Loading local canvas data:',
                    canvasData.substring(0, 100) + '...',
                );
                return JSON.parse(canvasData);
            }
            return null;
        } catch (error) {
            console.error('Error loading local canvas:', error);
            return null;
        }
    };

    const loadFromAPI = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/canvases/${canvasId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                },
            });

            if (!response.ok) {
                throw new Error(
                    `Error ${response.status}: ${response.statusText}`,
                );
            }

            const data = await response.json();
            if (data.status === 'success') {
                setCanvas(data.data.canvas);
            } else {
                throw new Error(data.message || 'Failed to load canvas');
            }
        } catch (err) {
            console.error('Error fetching canvas:', err);
            setError(
                err instanceof Error ? err.message : 'Failed to load canvas',
            );
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    };

    useEffect(() => {
        if (authLoading) {
            return;
        }

        const initializeCanvas = async () => {
            if (!isAuthenticated) {
                if (canvasId && canvasId !== 'new') {
                    router.replace('/canvas/new');
                    return;
                }
                const localCanvas = loadLocalCanvas();
                console.log('Loaded local canvas:', localCanvas);
                setCanvas(localCanvas);
                setLoading(false);
                setIsInitialized(true);
                return;
            }

            if (canvasId && canvasId !== 'new') {
                await loadFromAPI();
            } else {
                const localCanvas = loadLocalCanvas();
                setCanvas(localCanvas);
                setLoading(false);
                setIsInitialized(true);

                if (localCanvas) {
                    setTimeout(() => {
                        localStorage.removeItem('local_canvas_data');
                        console.log('Cleared local canvas data after loading');
                    }, 100);
                }
            }
        };

        initializeCanvas();
    }, [canvasId, isAuthenticated, authLoading, router]);

    // Update page title when canvas loads
    useEffect(() => {
        if (canvas?.name) {
            document.title = `${canvas.name} - Drawing Editor`;
        } else if (canvasId === 'new') {
            document.title = 'New Canvas - Drawing Editor';
        } else {
            document.title = 'Canvas - Drawing Editor';
        }
    }, [canvas, canvasId]);

    if (authLoading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                        {authLoading ? 'Initializing...' : 'Loading canvas...'}
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
                        Loading canvas...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
                <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">
                        Error Loading Canvas
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {error}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => router.push('/canvas/new')}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors">
                            New Canvas
                        </button>
                        <button
                            onClick={() => {
                                setError(null);
                                if (canvasId && canvasId !== 'new') {
                                    loadFromAPI();
                                }
                            }}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DrawingEditor initialCanvas={canvas} key={canvas?.name || 'empty'} />
    );
}
