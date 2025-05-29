/* eslint-disable prettier/prettier */
'use client';

import Link from 'next/link';
import { Canvas } from '@/types/canvas';
import { Edit2, Trash2, Calendar, ImageIcon, Loader } from 'lucide-react';
import { Dictionary } from '@/get-dictionary';

type CanvasGridProps = {
    canvases: Canvas[];
    lang: string;
    dict: Dictionary;
    deleteCanvas: (id: string) => void;
    isDeleting: string | null;
};

export default function CanvasGrid({
    canvases,
    lang,
    dict,
    deleteCanvas,
    isDeleting,
}: CanvasGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {canvases.map(canvas => (
                <div
                    key={canvas.id}
                    className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:shadow-purple-500/10 hover:scale-[1.02] transition-all duration-300 ease-out flex flex-col min-h-[280px]">
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-600 overflow-hidden">
                        {canvas.thumbnail ? (
                            <div
                                className="h-full w-full bg-cover bg-center"
                                style={{
                                    backgroundImage: `url(${canvas.thumbnail})`,
                                }}></div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <ImageIcon className="h-8 w-8" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                {canvas.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                {canvas.updatedAt.toLocaleDateString()}
                            </p>

                            {canvas.description && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                                        {canvas.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-colors duration-300">
                                {canvas.width}x{canvas.height}
                            </span>
                            <div className="mt-auto flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
                                <Link
                                    href={`/${lang}/canvas/${canvas.id}`}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-white/20 dark:hover:bg-gray-800/50 rounded transition-all duration-200"
                                    title={
                                        dict.account?.editCanvas || 'Edit canvas'
                                    }>
                                    <Edit2 className="h-4 w-4" />
                                </Link>

                                <button
                                    onClick={e => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        deleteCanvas(canvas.id);
                                    }}
                                    disabled={isDeleting === canvas.id}
                                    className="cursor-pointer p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-white/20 dark:hover:bg-gray-800/50 rounded disabled:opacity-50 transition-all duration-200"
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
                    </div>
                </div>
            ))}
        </div>
    );
}
