'use client';

import Link from 'next/link';
import { Canvas } from '@/types/canvas';
import { Edit2, Trash2, Clock, ImageIcon, Loader } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';

type CanvasListProps = {
    canvases: Canvas[];
    lang: string;
    dict: Dictionary;
    deleteCanvas: (id: string, name: string) => void;
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
                    className="group py-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded-lg transition-all duration-300 ease-out hover:shadow-md hover:shadow-purple-500/5 hover:scale-[1.005]">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden relative mr-4 group-hover:shadow-sm transition-shadow duration-300">
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
                        {/* Canvas background color overlay */}
                        <div
                            className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity duration-300"
                            style={{
                                backgroundColor:
                                    canvas.backgroundColor || '#FFFFFF',
                            }}></div>
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                                    {canvas.name}
                                </h3>
                                {canvas.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        {canvas.description}
                                    </p>
                                )}
                            </div>

                            <div className="ml-4 flex-shrink-0 flex space-x-1 opacity-70 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                                <Link
                                    href={`/${lang}/canvas/${canvas.id}`}
                                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-all duration-200"
                                    title={
                                        dict.account?.editCanvas ||
                                        'Edit canvas'
                                    }>
                                    <Edit2 className="sm:h-4 sm:w-4 h-5 w-5" />
                                </Link>

                                <button
                                    onClick={() =>
                                        deleteCanvas(canvas.id, canvas.name)
                                    }
                                    disabled={isDeleting === canvas.id}
                                    className="cursor-pointer p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-50 transition-all duration-200"
                                    title={
                                        dict.account?.deleteCanvas ||
                                        'Delete canvas'
                                    }>
                                    {isDeleting === canvas.id ? (
                                        <Loader className="sm:h-4 sm:w-4 h-5 w-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="sm:h-4 sm:w-4 h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                            <span className="inline-flex items-center group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {canvas.updatedAt.toLocaleDateString()}
                            </span>

                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 group-hover:scale-105 transition-all duration-300">
                                {canvas.width}x{canvas.height}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
