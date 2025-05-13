'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import {
    User,
    Upload,
    Trash2,
    Edit2,
    ChevronRight,
    LogOut,
    Lock,
    ImageIcon,
    PlusCircle,
    LayoutGrid,
    Calendar,
    Clock,
    Search,
    AlertTriangle,
    List,
    CheckCircle,
    Loader,
} from 'lucide-react';
import { API_URL } from '@/config';
import { Canvas } from '@/types/canvas';

export default function AccountPage() {
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const {
        user,
        logout,
        isLoading,
        token,
        updateUser,
        updateUserAvatar,
        deleteUserAvatar,
    } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [canvases, setCanvases] = useState<Canvas[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [isUploading, setIsUploading] = useState(false);
    const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isFetchingCanvases, setIsFetchingCanvases] = useState(false);

    useEffect(() => {
        if (!isLoading && user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                username: user.username || '',
                email: user.email || '',
            });
        }
    }, [user, isLoading]);

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
                    // Convert dates from strings to Date objects
                    const processedCanvases = data.data.canvases.map(
                        (canvas: any) => ({
                            ...canvas,
                            createdAt: new Date(canvas.createdAt),
                            updatedAt: new Date(canvas.updatedAt),
                            lastModified: canvas.lastModified
                                ? new Date(canvas.lastModified)
                                : null,
                        }),
                    );

                    setCanvases(processedCanvases);
                }
            } catch (err) {
                console.error('Error fetching canvases:', err);
                setError(
                    dict.account?.fetchCanvasesError ||
                        'Failed to load your canvases',
                );
                setTimeout(() => setError(''), 3000);
            } finally {
                setIsFetchingCanvases(false);
                setIsLoaded(true);
            }
        };

        fetchCanvases();
    }, [token, user, dict.account?.fetchCanvasesError]);

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setError('');
        try {
            await updateUserAvatar(file);
            setSuccess(
                dict.account?.avatarUploadSuccess ||
                    'Avatar updated successfully',
            );
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError(
                dict.account?.avatarUploadError || 'Failed to upload avatar',
            );
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        setIsUploading(true);
        setError('');
        try {
            await deleteUserAvatar();
            setSuccess(
                dict.account?.avatarDeleteSuccess ||
                    'Avatar removed successfully',
            );
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError(
                dict.account?.avatarDeleteError || 'Failed to remove avatar',
            );
            setTimeout(() => setError(''), 3000);
        } finally {
            setIsUploading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateUser({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                username: profileData.username,
            });
            setIsEditing(false);
            setSuccess(
                dict.account?.profileUpdateSuccess ||
                    'Profile updated successfully',
            );
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            setError(
                dict.account?.profileUpdateError || 'Failed to update profile',
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push(`/${lang}/login`);
        } catch {
            setError(dict.account?.logoutError || 'Failed to logout');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteAccountConfirm !== user?.username) {
            setError(
                dict.account?.deleteAccountConfirmError ||
                    'Username does not match',
            );
            return;
        }
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error('Failed to delete account');
            router.push(`/${lang}/login`);
        } catch {
            setError(
                dict.account?.deleteAccountError || 'Failed to delete account',
            );
        }
    };

    // New function to create a canvas
    const handleCreateCanvas = async () => {
        setIsCreatingCanvas(true);
        setError('');

        try {
            // Generate a unique layer ID that will be consistent
            const layerId = Date.now().toString();

            // Default resolution setup for a new canvas
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
                isPublic: false,
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
                // Make sure we're redirecting to the canvas with the ID
                router.push(`/${lang}/canvas/${data.data.canvas.id}`);
            } else {
                throw new Error('Failed to create canvas');
            }
        } catch (err) {
            console.error('Error creating canvas:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
            setIsCreatingCanvas(false);
        }
    };

    const deleteCanvas = async (id: string) => {
        setIsDeleting(id);
        try {
            const response = await fetch(`${API_URL}/canvases/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete canvas');
            }

            // Remove the canvas from the state
            setCanvases(prevCanvases =>
                prevCanvases.filter(canvas => canvas.id !== id),
            );
            setSuccess(
                dict.account?.canvasDeleteSuccess ||
                    'Canvas deleted successfully',
            );
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error deleting canvas:', err);
            const errorMessage =
                err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setTimeout(() => setError(''), 3000);
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
        } else if (sortBy === 'lastModified') {
            const bDate = b.lastModified
                ? Number(new Date(b.lastModified))
                : Number(new Date(b.updatedAt));
            const aDate = a.lastModified
                ? Number(new Date(a.lastModified))
                : Number(new Date(a.updatedAt));
            return bDate - aDate;
        }
        return 0;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            </div>
        );
    }

    if (!user) {
        router.push(`/${lang}/login`);
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
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
                                {canvases.length}
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
            {/* Success message */}
            {success && (
                <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded-md animate-fadeIn flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{success}</span>
                    </div>
                </div>
            )}
            {/* Error message */}
            {error && (
                <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md animate-fadeIn flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                </div>
            )}
            {/* Main content */}
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-8">
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                                        activeTab === 'profile'
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}>
                                    <User
                                        className={`mr-3 h-5 w-5 ${
                                            activeTab === 'profile'
                                                ? 'text-purple-500'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    />
                                    <span className="font-medium">
                                        {dict.account?.profileTab || 'Profile'}
                                    </span>
                                    <ChevronRight
                                        className={`ml-auto h-5 w-5 ${
                                            activeTab === 'profile'
                                                ? 'text-purple-500'
                                                : 'text-gray-400'
                                        }`}
                                    />
                                </button>
                                <button
                                    onClick={() => setActiveTab('canvases')}
                                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                                        activeTab === 'canvases'
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}>
                                    <ImageIcon
                                        className={`mr-3 h-5 w-5 ${
                                            activeTab === 'canvases'
                                                ? 'text-purple-500'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    />
                                    <span className="font-medium">
                                        {dict.account?.canvasesTab ||
                                            'My Canvases'}
                                    </span>
                                    <ChevronRight
                                        className={`ml-auto h-5 w-5 ${
                                            activeTab === 'canvases'
                                                ? 'text-purple-500'
                                                : 'text-gray-400'
                                        }`}
                                    />
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                                        activeTab === 'security'
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}>
                                    <Lock
                                        className={`mr-3 h-5 w-5 ${
                                            activeTab === 'security'
                                                ? 'text-purple-500'
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                    />
                                    <span className="font-medium">
                                        {dict.account?.securityTab ||
                                            'Security'}
                                    </span>
                                    <ChevronRight
                                        className={`ml-auto h-5 w-5 ${
                                            activeTab === 'security'
                                                ? 'text-purple-500'
                                                : 'text-gray-400'
                                        }`}
                                    />
                                </button>
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center px-3 py-2 w-full text-left rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                                        <LogOut className="mr-3 h-5 w-5" />
                                        <span className="font-medium">
                                            {dict.account?.logout || 'Logout'}
                                        </span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                        {/* Profile tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {dict.account?.profileSettings ||
                                            'Profile Settings'}
                                    </h2>
                                    {!isEditing ? (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            {dict.account?.editProfile ||
                                                'Edit Profile'}
                                        </button>
                                    ) : (
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() =>
                                                    setIsEditing(false)
                                                }
                                                className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                                                {dict.account?.cancel ||
                                                    'Cancel'}
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={isSaving}
                                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-70 flex items-center">
                                                {isSaving ? (
                                                    <>
                                                        <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                        {dict.account?.saving ||
                                                            'Saving...'}
                                                    </>
                                                ) : (
                                                    dict.account?.saveChanges ||
                                                    'Save Changes'
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label
                                                htmlFor="firstName"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {dict.account?.firstName ||
                                                    'First Name'}
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="firstName"
                                                    name="firstName"
                                                    value={
                                                        profileData.firstName
                                                    }
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">
                                                    {profileData.firstName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="lastName"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {dict.account?.lastName ||
                                                    'Last Name'}
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="lastName"
                                                    name="lastName"
                                                    value={profileData.lastName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">
                                                    {profileData.lastName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="username"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {dict.account?.username ||
                                                    'Username'}
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    value={profileData.username}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white">
                                                    @{profileData.username}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {dict.account?.email || 'Email'}
                                            </label>
                                            <p className="text-gray-900 dark:text-white">
                                                {profileData.email}
                                            </p>
                                            {user && !user.isEmailVerified && (
                                                <div className="mt-1 flex items-center text-amber-600 dark:text-amber-400 text-sm">
                                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                                    {dict.account
                                                        ?.emailNotVerified ||
                                                        'Email not verified'}
                                                    <button className="ml-2 text-purple-600 dark:text-purple-400 hover:underline">
                                                        {dict.account
                                                            ?.verifyNow ||
                                                            'Verify now'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            {dict.account?.accountManagement ||
                                                'Account Management'}
                                        </h3>
                                        <button
                                            onClick={() =>
                                                setShowDeleteModal(true)
                                            }
                                            className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 flex items-center">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {dict.account?.deleteAccount ||
                                                'Delete Account'}
                                        </button>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {dict.account
                                                ?.deleteAccountWarning ||
                                                'This action cannot be undone. All your data will be permanently deleted.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Canvases tab */}
                        {activeTab === 'canvases' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {dict.account?.myCanvases ||
                                            'My Canvases'}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={
                                                    dict.account
                                                        ?.searchCanvases ||
                                                    'Search canvases...'
                                                }
                                                className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
                                                value={searchQuery}
                                                onChange={e =>
                                                    setSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                                            <button
                                                className={`p-2 ${
                                                    viewMode === 'grid'
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                }`}
                                                onClick={() =>
                                                    setViewMode('grid')
                                                }
                                                title={
                                                    dict.account?.gridView ||
                                                    'Grid view'
                                                }>
                                                <LayoutGrid className="h-5 w-5" />
                                            </button>
                                            <button
                                                className={`p-2 ${
                                                    viewMode === 'list'
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                }`}
                                                onClick={() =>
                                                    setViewMode('list')
                                                }
                                                title={
                                                    dict.account?.listView ||
                                                    'List view'
                                                }>
                                                <List className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <select
                                            className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2 text-sm"
                                            value={sortBy}
                                            onChange={e =>
                                                setSortBy(e.target.value)
                                            }>
                                            <option value="updatedAt">
                                                {dict.account
                                                    ?.sortByLastModified ||
                                                    'Last modified'}
                                            </option>
                                            <option value="createdAt">
                                                {dict.account?.sortByCreated ||
                                                    'Created date'}
                                            </option>
                                            <option value="name">
                                                {dict.account?.sortByName ||
                                                    'Name'}
                                            </option>
                                        </select>
                                        <button
                                            onClick={handleCreateCanvas}
                                            disabled={isCreatingCanvas}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center shadow-sm hover:shadow disabled:opacity-70">
                                            {isCreatingCanvas ? (
                                                <>
                                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                    {dict.account
                                                        ?.creatingCanvas ||
                                                        'Creating...'}
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    {dict.account?.newCanvas ||
                                                        'New Canvas'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Loading state */}
                                    {isFetchingCanvases && !isLoaded && (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {isLoaded &&
                                        sortedCanvases.length === 0 && (
                                            <div className="text-center py-12">
                                                <ImageIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                                                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                                                    {searchQuery
                                                        ? dict.account
                                                              ?.noCanvasesFound ||
                                                          'No canvases found'
                                                        : dict.account
                                                              ?.noCanvasesYet ||
                                                          'No canvases yet'}
                                                </h3>
                                                <p className="mt-1 text-gray-500 dark:text-gray-400">
                                                    {searchQuery
                                                        ? dict.account
                                                              ?.tryDifferentSearch ||
                                                          'Try a different search term'
                                                        : dict.account
                                                              ?.getStartedWithCanvas ||
                                                          'Get started by creating a new canvas'}
                                                </p>
                                                {!searchQuery && (
                                                    <div className="mt-6">
                                                        <button
                                                            onClick={
                                                                handleCreateCanvas
                                                            }
                                                            disabled={
                                                                isCreatingCanvas
                                                            }
                                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center shadow-sm hover:shadow disabled:opacity-70">
                                                            {isCreatingCanvas ? (
                                                                <>
                                                                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                                                                    {dict
                                                                        .account
                                                                        ?.creating ||
                                                                        'Creating...'}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PlusCircle className="mr-2 h-5 w-5" />
                                                                    {dict
                                                                        .account
                                                                        ?.createFirstCanvas ||
                                                                        'Create your first canvas'}
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    {/* Grid view */}
                                    {isLoaded &&
                                        sortedCanvases.length > 0 &&
                                        viewMode === 'grid' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {sortedCanvases.map(canvas => (
                                                    <div
                                                        key={canvas.id}
                                                        className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
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
                                                            {/* Canvas background color overlay */}
                                                            <div
                                                                className="absolute inset-0 bg-opacity-20 group-hover:opacity-80 transition-opacity duration-300"
                                                                style={{
                                                                    backgroundColor:
                                                                        canvas.backgroundColor ||
                                                                        '#FFFFFF',
                                                                }}></div>
                                                        </div>
                                                        <div className="p-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                                        {
                                                                            canvas.name
                                                                        }
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                                                        <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                        {canvas.updatedAt.toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                    <Link
                                                                        href={`/${lang}/canvas/${canvas.id}`}
                                                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                                                        title={
                                                                            dict
                                                                                .account
                                                                                ?.editCanvas ||
                                                                            'Edit canvas'
                                                                        }>
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={e => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            deleteCanvas(
                                                                                canvas.id,
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            isDeleting ===
                                                                            canvas.id
                                                                        }
                                                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 relative z-20"
                                                                        title={
                                                                            dict
                                                                                .account
                                                                                ?.deleteCanvas ||
                                                                            'Delete canvas'
                                                                        }>
                                                                        {isDeleting ===
                                                                        canvas.id ? (
                                                                            <Loader className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <Trash2 className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                                                                    {
                                                                        canvas.width
                                                                    }
                                                                    x
                                                                    {
                                                                        canvas.height
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <Link
                                                            href={`/${lang}/canvas/${canvas.id}`}
                                                            className="absolute inset-0 z-10 focus:outline-none"
                                                            aria-label={`Edit ${canvas.name}`}>
                                                            <span className="sr-only">
                                                                {dict.account
                                                                    ?.editCanvas ||
                                                                    'Edit canvas'}
                                                            </span>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                    {/* List view */}
                                    {isLoaded &&
                                        sortedCanvases.length > 0 &&
                                        viewMode === 'list' && (
                                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {sortedCanvases.map(canvas => (
                                                    <div
                                                        key={canvas.id}
                                                        className="py-4 flex items-center hover:bg-gray-600 dark:hover:bg-gray-750 px-2 rounded-lg transition-colors duration-200">
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
                                                                        canvas.backgroundColor ||
                                                                        '#FFFFFF',
                                                                }}></div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                                    {
                                                                        canvas.name
                                                                    }
                                                                </h3>
                                                                <div className="ml-4 flex-shrink-0 flex space-x-2">
                                                                    <Link
                                                                        href={`/${lang}/canvas/${canvas.id}`}
                                                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                                                        title={
                                                                            dict
                                                                                .account
                                                                                ?.editCanvas ||
                                                                            'Edit canvas'
                                                                        }>
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Link>
                                                                    <button
                                                                        onClick={() =>
                                                                            deleteCanvas(
                                                                                canvas.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isDeleting ===
                                                                            canvas.id
                                                                        }
                                                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                                                                        title={
                                                                            dict
                                                                                .account
                                                                                ?.deleteCanvas ||
                                                                            'Delete canvas'
                                                                        }>
                                                                        {isDeleting ===
                                                                        canvas.id ? (
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
                                                                    {
                                                                        canvas.width
                                                                    }
                                                                    x
                                                                    {
                                                                        canvas.height
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}

                        {/* Security tab */}
                        {activeTab === 'security' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {dict.account?.security || 'Security'}
                                    </h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                            {dict.account?.changePassword ||
                                                'Change Password'}
                                        </h3>
                                        <Link
                                            href={`/${lang}/reset-password`}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                                            <Lock className="mr-2 h-4 w-4" />
                                            {dict.account?.changePassword ||
                                                'Change Password'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete account confirmation modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto"
                    aria-labelledby="modal-title"
                    role="dialog"
                    aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"
                            aria-hidden="true"></div>
                        <span
                            className="hidden sm:inline-block sm:align-middle sm:h-screen"
                            aria-hidden="true">
                            &#8203;
                        </span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3
                                            className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                                            id="modal-title">
                                            {dict.account?.deleteAccountTitle ||
                                                'Delete account'}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {dict.account
                                                    ?.deleteAccountDescription ||
                                                    'Are you sure you want to delete your account? All of your data will be permanently removed. This action cannot be undone.'}
                                            </p>
                                            <div className="mt-4">
                                                <label
                                                    htmlFor="confirm-delete"
                                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {dict.account
                                                        ?.deleteAccountConfirm ||
                                                        `Type "${user?.username}" to confirm`}
                                                </label>
                                                <input
                                                    type="text"
                                                    id="confirm-delete"
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    value={deleteAccountConfirm}
                                                    onChange={e =>
                                                        setDeleteAccountConfirm(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleDeleteAccount}
                                    disabled={
                                        deleteAccountConfirm !== user?.username
                                    }>
                                    {dict.account?.deleteAccountButton ||
                                        'Delete account'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowDeleteModal(false)}>
                                    {dict.account?.cancel || 'Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
