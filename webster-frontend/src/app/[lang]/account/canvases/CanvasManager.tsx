'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useStatus } from '@/contexts/StatusContext';
import { API_URL } from '@/config';
import { Canvas } from '@/types/canvas';
import { Search, LayoutGrid, List, PlusCircle, Loader } from 'lucide-react';
import CanvasGrid from './CanvasGrid';
import CanvasList from './CanvasList';
import { Dictionary } from '@/get-dictionary';
import ConfirmationModal from '@/components/ConfirmationModal';

interface EmptyCanvasStateProps {
    searchQuery: string;
    dict: Dictionary;
    handleCreateCanvas: () => void;
    isCreatingCanvas: boolean;
}

export default function CanvasManager() {
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const { user, token } = useAuth();
    const { showStatus } = useStatus();

    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [canvases, setCanvases] = useState<Canvas[]>([]);
    const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isFetchingCanvases, setIsFetchingCanvases] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        canvasId: string | null;
        canvasName: string;
    }>({
        isOpen: false,
        canvasId: null,
        canvasName: '',
    });

    useEffect(() => {
        const fetchCanvases = async () => {
            if (!token || !user) return;
            setIsFetchingCanvases(true);
            try {
                const response = await fetch(`${API_URL}/canvases`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch canvases');
                }

                const data = await response.json();
                if (data.status === 'success' && data.data.canvases) {
                    const processedCanvases = data.data.canvases.map(
                        (canvas: Canvas) => ({
                            ...canvas,
                            createdAt: new Date(canvas.createdAt),
                            updatedAt: new Date(canvas.updatedAt),
                        }),
                    );
                    setCanvases(processedCanvases);
                }
            } catch (err) {
                console.error('Error fetching canvases:', err);
                showStatus(
                    'error',
                    dict.account?.fetchCanvasesError ||
                        'Failed to load your canvases',
                );
            } finally {
                setIsFetchingCanvases(false);
                setIsLoaded(true);
            }
        };

        fetchCanvases();
    }, [token, user, dict.account?.fetchCanvasesError, showStatus]);

    const handleCreateCanvas = async () => {
        setIsCreatingCanvas(true);
        try {
            const layerId = Date.now().toString();
            const defaultCanvas = {
                name: 'Untitled Canvas',
                width: 800,
                height: 600,
                backgroundColor: '#FFFFFF',
                layers: [
                    {
                        id: layerId,
                        name: 'Layer 1',
                        visible: true,
                        locked: false,
                        opacity: 1,
                    },
                ],
                elementsByLayer: {
                    [layerId]: [],
                },
            };

            const response = await fetch(`${API_URL}/canvases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(defaultCanvas),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create canvas');
            }

            const data = await response.json();
            if (data.status === 'success' && data.data.canvas) {
                router.push(`/${lang}/canvas/${data.data.canvas.id}`);
            } else {
                throw new Error('Failed to create canvas');
            }
        } catch (err) {
            console.error('Error creating canvas:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'An error occurred';
            showStatus('error', errorMessage);
            setIsCreatingCanvas(false);
        }
    };

    const handleDeleteCanvas = (id: string, name: string) => {
        setDeleteModal({
            isOpen: true,
            canvasId: id,
            canvasName: name,
        });
    };

    const confirmDeleteCanvas = async () => {
        if (!user || !deleteModal.canvasId || !token) return;

        try {
            setIsDeleting(deleteModal.canvasId);
            const response = await fetch(
                `${API_URL}/canvases/${deleteModal.canvasId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete canvas');
            }

            setCanvases(prev =>
                prev.filter(canvas => canvas.id !== deleteModal.canvasId),
            );
            setDeleteModal({
                isOpen: false,
                canvasId: null,
                canvasName: '',
            });
            showStatus(
                'success',
                dict.account?.canvasDeleteSuccess ||
                    'Canvas deleted successfully',
            );
        } catch (err) {
            console.error('Error deleting canvas:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'An error occurred';
            showStatus('error', errorMessage);
        } finally {
            setIsDeleting(null);
        }
    };

    const filteredCanvases = canvases.filter(canvas =>
        canvas.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sortedCanvases = [...filteredCanvases].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'createdAt') {
            return (
                Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
            );
        } else if (sortBy === 'updatedAt') {
            return (
                Number(new Date(b.updatedAt)) - Number(new Date(a.updatedAt))
            );
        }
        return 0;
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {dict.account?.myCanvases || 'My Canvases'}
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-y-3 sm:gap-x-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={
                                dict.account?.searchCanvases ||
                                'Search canvases...'
                            }
                            className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-full sm:w-auto max-w-xs">
                        <button
                            className={`p-2 flex-1 flex items-center justify-center ${
                                viewMode === 'grid'
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                    : 'cursor-pointer bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => setViewMode('grid')}
                            title={dict.account?.gridView || 'Grid view'}>
                            <LayoutGrid className="h-5 w-5" />
                        </button>
                        <button
                            className={`p-2 flex-1 flex items-center justify-center ${
                                viewMode === 'list'
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                    : 'cursor-pointer bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => setViewMode('list')}
                            title={dict.account?.listView || 'List view'}>
                            <List className="h-5 w-5" />
                        </button>
                    </div>

                    <select
                        className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 text-sm w-full sm:w-auto max-w-xs"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}>
                        <option value="updatedAt">
                            {dict.account?.sortByLastModified ||
                                'Last modified'}
                        </option>
                        <option value="createdAt">
                            {dict.account?.sortByCreated || 'Created date'}
                        </option>
                        <option value="name">
                            {dict.account?.sortByName || 'Name'}
                        </option>
                    </select>

                    <button
                        onClick={handleCreateCanvas}
                        disabled={isCreatingCanvas}
                        className="items-center justify-center cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center shadow-sm hover:shadow disabled:opacity-70 w-full sm:w-auto mt-2 sm:mt-0">
                        {isCreatingCanvas ? (
                            <>
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                {dict.account?.creatingCanvas || 'Creating...'}
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                {dict.account?.newCanvas || 'New Canvas'}
                            </>
                        )}
                    </button>
                </div>
            </div>
            <div className="p-6">
                {isFetchingCanvases && !isLoaded && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
                    </div>
                )}
                {isLoaded && sortedCanvases.length === 0 && (
                    <EmptyCanvasState
                        searchQuery={searchQuery}
                        dict={dict}
                        handleCreateCanvas={handleCreateCanvas}
                        isCreatingCanvas={isCreatingCanvas}
                    />
                )}
                {isLoaded &&
                    sortedCanvases.length > 0 &&
                    (viewMode === 'grid' ? (
                        <CanvasGrid
                            canvases={sortedCanvases}
                            lang={lang}
                            dict={dict}
                            deleteCanvas={handleDeleteCanvas}
                            isDeleting={isDeleting}
                        />
                    ) : (
                        <CanvasList
                            canvases={sortedCanvases}
                            lang={lang}
                            dict={dict}
                            deleteCanvas={handleDeleteCanvas}
                            isDeleting={isDeleting}
                        />
                    ))}
            </div>
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() =>
                    setDeleteModal({
                        isOpen: false,
                        canvasId: null,
                        canvasName: '',
                    })
                }
                onConfirm={confirmDeleteCanvas}
                title={dict.account?.deleteCanvas || 'Delete Canvas'}
                message={(
                    dict.account.deleteCanvasConfirmationMessage ||
                    `Are you sure you want to delete "${deleteModal.canvasName}"? This action cannot be undone.`
                ).replace('{canvasName}', deleteModal.canvasName)}
                confirmText={dict.account?.delete || 'Delete'}
                cancelText={dict.account?.cancel || 'Cancel'}
                type="danger"
                isLoading={isDeleting === deleteModal.canvasId}
            />
        </div>
    );
}

function EmptyCanvasState({
    searchQuery,
    dict,
    handleCreateCanvas,
    isCreatingCanvas,
}: EmptyCanvasStateProps) {
    return (
        <div className="text-center py-12">
            <LayoutGrid className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                {searchQuery
                    ? dict.account?.noCanvasesFound || 'No canvases found'
                    : dict.account?.noCanvasesYet || 'No canvases yet'}
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
                {searchQuery
                    ? dict.account?.tryDifferentSearch ||
                      'Try a different search term'
                    : dict.account?.getStartedWithCanvas ||
                      'Get started by creating a new canvas'}
            </p>
            {!searchQuery && (
                <div className="mt-6">
                    <button
                        onClick={handleCreateCanvas}
                        disabled={isCreatingCanvas}
                        className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center shadow-sm hover:shadow disabled:opacity-70">
                        {isCreatingCanvas ? (
                            <>
                                <Loader className="mr-2 h-5 w-5 animate-spin" />
                                {dict.account?.creating || 'Creating...'}
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-5 w-5" />
                                {dict.account?.createFirstCanvas ||
                                    'Create your first canvas'}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
