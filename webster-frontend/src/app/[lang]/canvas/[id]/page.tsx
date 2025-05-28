'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Canvas as CanvasType } from '@/types/canvas';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';
import { API_URL } from '@/config';

const DrawingEditor = dynamic(() => import('./DrawingEditor'), { ssr: false });

export default function CanvasPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [canvas, setCanvas] = useState<CanvasType | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Start with true
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false); // Track initialization
    const canvasId = params.id as string;

    // Helper function to load local canvas
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
        // Don't do anything until auth loading is complete
        if (authLoading) {
            return;
        }

        const initializeCanvas = async () => {
            // Handle different scenarios based on authentication and canvas ID
            if (!isAuthenticated) {
                // Unauthenticated users: ignore canvas ID and load local canvas or start fresh
                if (canvasId && canvasId !== 'new') {
                    // Redirect to /new for unauthenticated users trying to access specific canvas
                    router.replace('/canvas/new');
                    return;
                }

                // Load local canvas if it exists
                const localCanvas = loadLocalCanvas();
                console.log('Loaded local canvas:', localCanvas);

                setCanvas(localCanvas);
                setLoading(false);
                setIsInitialized(true);

                // Don't clear localStorage here for unauthenticated users
                // They might want to keep working on their template

                return;
            }

            // Authenticated users: handle normal canvas loading
            if (canvasId && canvasId !== 'new') {
                await loadFromAPI();
            } else {
                // New canvas for authenticated users - check for local template data first
                const localCanvas = loadLocalCanvas();
                setCanvas(localCanvas);
                setLoading(false);
                setIsInitialized(true);

                // Clear the template data after loading to prevent it from
                // persisting to the next new canvas creation
                if (localCanvas) {
                    // Use setTimeout to ensure the data is used by DrawingEditor first
                    setTimeout(() => {
                        localStorage.removeItem('local_canvas_data');
                        console.log('Cleared local canvas data after loading');
                    }, 100);
                }
            }
        };

        initializeCanvas();
    }, [canvasId, isAuthenticated, authLoading, router]);

    // Show loading while auth is loading OR while we're initializing
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

    // Only render DrawingEditor when we're fully initialized
    return (
        <DrawingEditor initialCanvas={canvas} key={canvas?.name || 'empty'} />
    );
}
