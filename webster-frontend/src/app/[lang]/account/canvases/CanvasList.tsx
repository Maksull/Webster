'use client';

import Link from 'next/link';
import { Canvas } from '@/types/canvas';
import { Edit2, Trash2, Clock, ImageIcon, Loader } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';

type CanvasListProps = {
    canvases: Canvas[];
    lang: string;
    dict: Dictionary;
    deleteCanvas: (id: string) => void;
    isDeleting: string | null;
};

export default function CanvasList({
    canvases,
    lang,
    dict,
    deleteCanvas,
    isDeleting,
}: CanvasListProps) {
    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {canvases.map(canvas => (
                <div
                    key={canvas.id}
                    className="py-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-750 px-2 rounded-lg transition-colors duration-200">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden relative mr-4">
                        {canvas.thumbnail ? (
                            <div
                                className="h-full w-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${canvas.thumbnail})`,
                                }}></div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <ImageIcon className="h-6 w-6" />
                            </div>
                        )}
                        <div
                            className="absolute inset-0 bg-opacity-20"
                            style={{
                                backgroundColor:
                                    canvas.backgroundColor || '#FFFFFF',
                            }}></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {canvas.name}
                            </h3>

                            <div className="ml-4 flex-shrink-0 flex space-x-2">
                                <Link
                                    href={`/${lang}/canvas/${canvas.id}`}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                    title={
                                        dict.account?.editCanvas ||
                                        'Edit canvas'
                                    }>
                                    <Edit2 className="h-4 w-4" />
                                </Link>

                                <button
                                    onClick={() => deleteCanvas(canvas.id)}
                                    disabled={isDeleting === canvas.id}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                                    title={
                                        dict.account?.deleteCanvas ||
                                        'Delete canvas'
                                    }>
                                    {isDeleting === canvas.id ? (
                                        <Loader className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                            <span className="inline-flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {canvas.lastModified
                                    ? canvas.lastModified.toLocaleDateString()
                                    : canvas.updatedAt.toLocaleDateString()}
                            </span>

                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                                {canvas.width}x{canvas.height}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
