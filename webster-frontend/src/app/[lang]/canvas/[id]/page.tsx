'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Canvas as CanvasType } from '@/types/canvas';
import dynamic from 'next/dynamic';
import { API_URL } from '@/config';

const DrawingEditor = dynamic(() => import('./DrawingEditor'), { ssr: false });

export default function CanvasPage() {
    const params = useParams();
    const [canvas, setCanvas] = useState<CanvasType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const canvasId = params.id as string;

    useEffect(() => {
        // Only fetch if canvasId exists and isn't "new"
        if (canvasId && canvasId !== 'new') {
            setLoading(true);
            setError(null);

            fetch(`${API_URL}/canvases/${canvasId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    // Include auth token if you have authentication
                    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(
                            `Error ${response.status}: ${response.statusText}`,
                        );
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        setCanvas(data.data.canvas);
                    } else {
                        throw new Error(
                            data.message || 'Failed to load canvas',
                        );
                    }
                })
                .catch(err => {
                    console.error('Error fetching canvas:', err);
                    setError(err.message || 'Failed to load canvas');
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [canvasId]);

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
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return <DrawingEditor initialCanvas={canvas} />;
}
