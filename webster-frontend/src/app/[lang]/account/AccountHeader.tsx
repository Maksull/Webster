'use client';

import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { useDictionary } from '@/contexts/DictionaryContext';
import { API_URL } from '@/config';
import { useRef, useState, useEffect } from 'react';
import { User, Upload, Trash2 } from 'lucide-react';
import { useStatus } from '@/contexts/StatusContext';

export default function AccountHeader() {
    const { dict } = useDictionary();
    const { user, token, updateUserAvatar, deleteUserAvatar } = useAuth();
    const { showStatus } = useStatus();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [canvasCount, setCanvasCount] = useState(0);

    useEffect(() => {
        const fetchCanvasCount = async () => {
            if (!token || !user) return;

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
                    setCanvasCount(data.data.canvases.length);
                }
            } catch (err) {
                console.error('Error fetching canvases count:', err);
            }
        };

        fetchCanvasCount();
    }, [token, user]);

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            await updateUserAvatar(file);
            showStatus(
                'success',
                dict.account?.avatarUploadSuccess ||
                    'Avatar updated successfully',
            );
        } catch {
            showStatus(
                'error',
                dict.account?.avatarUploadError || 'Failed to upload avatar',
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setIsUploading(true);

        try {
            await deleteUserAvatar();
            showStatus(
                'success',
                dict.account?.avatarDeleteSuccess ||
                    'Avatar removed successfully',
            );
        } catch {
            showStatus(
                'error',
                dict.account?.avatarDeleteError || 'Failed to remove avatar',
            );
        } finally {
            setIsUploading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 py-16 px-4 sm:px-6 lg:px-8 text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
                    <div className="relative group">
                        <div
                            className="h-28 w-28 rounded-full bg-white bg-opacity-20 backdrop-blur-sm overflow-hidden cursor-pointer flex items-center justify-center border-4 border-white border-opacity-30 hover:border-opacity-50 transition-all duration-300 shadow-lg"
                            onClick={handleAvatarClick}>
                            {user.avatar ? (
                                <Image
                                    src={`${API_URL}/public/img/users/${user.avatar}`}
                                    alt={user.username}
                                    width={112}
                                    height={112}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                                    <User className="h-14 w-14" />
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />

                            {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
                                    <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-1">
                            <button
                                onClick={handleAvatarClick}
                                className="bg-white bg-opacity-90 rounded-full p-1.5 text-purple-600 hover:text-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                                title={
                                    dict.account?.uploadAvatar ||
                                    'Upload avatar'
                                }>
                                <Upload className="h-4 w-4" />
                            </button>

                            {user.avatar && (
                                <button
                                    onClick={handleDeleteAvatar}
                                    className="bg-white bg-opacity-90 rounded-full p-1.5 text-red-500 hover:text-red-600 shadow-md hover:shadow-lg transition-all duration-200"
                                    title={
                                        dict.account?.deleteAvatar ||
                                        'Remove avatar'
                                    }>
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-white text-opacity-90 mt-1">
                            @{user.username}
                        </p>
                        <p className="text-white text-opacity-80 mt-1">
                            {user.email}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="bg-purple-600/30 dark:bg-purple-800/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white border border-white/20">
                                {dict.account?.canvasesCount || 'Canvases'}:{' '}
                                {canvasCount}
                            </span>

                            <span className="bg-pink-600/30 dark:bg-pink-800/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white border border-white/20">
                                {dict.account?.memberSince || 'Member since'}:{' '}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </span>

                            {user.role === 'admin' && (
                                <span className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-white border border-white/20">
                                    {dict.account?.admin || 'Admin'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
