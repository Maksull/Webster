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
    Star,
    PlusCircle,
    LayoutGrid,
    Calendar,
    Clock,
    Search,
    AlertTriangle,
    List,
    CheckCircle,
} from 'lucide-react';
import { API_URL } from '@/config';

// Define proper types for the design
interface Design {
    id: string;
    name: string;
    thumbnail: string;
    createdAt: Date;
    lastModified: Date;
    type: string;
    starred: boolean;
}

// Mock data for designs
const mockDesigns: Design[] = [
    {
        id: '1',
        name: 'Social Media Banner',
        thumbnail: '/mockImages/design1.jpg',
        createdAt: new Date(2023, 10, 15),
        lastModified: new Date(2023, 10, 20),
        type: 'banner',
        starred: true,
    },
    {
        id: '2',
        name: 'Product Promotion',
        thumbnail: '/mockImages/design2.jpg',
        createdAt: new Date(2023, 11, 5),
        lastModified: new Date(2023, 11, 5),
        type: 'post',
        starred: false,
    },
    {
        id: '3',
        name: 'Event Poster',
        thumbnail: '/mockImages/design3.jpg',
        createdAt: new Date(2024, 0, 10),
        lastModified: new Date(2024, 0, 12),
        type: 'poster',
        starred: true,
    },
    {
        id: '4',
        name: 'Logo Design',
        thumbnail: '/mockImages/design4.jpg',
        createdAt: new Date(2024, 1, 3),
        lastModified: new Date(2024, 1, 15),
        type: 'logo',
        starred: false,
    },
    {
        id: '5',
        name: 'Website Banner',
        thumbnail: '/mockImages/design5.jpg',
        createdAt: new Date(2024, 2, 20),
        lastModified: new Date(2024, 2, 21),
        type: 'banner',
        starred: false,
    },
    {
        id: '6',
        name: 'Instagram Story',
        thumbnail: '/mockImages/design6.jpg',
        createdAt: new Date(2024, 3, 5),
        lastModified: new Date(2024, 3, 5),
        type: 'story',
        starred: false,
    },
];

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
    const [designs, setDesigns] = useState<Design[]>(mockDesigns);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('lastModified');
    const [isUploading, setIsUploading] = useState(false);
    const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            // Implement actual account deletion when ready
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

    const toggleStarDesign = (id: string) => {
        setDesigns(
            designs.map(design =>
                design.id === id
                    ? { ...design, starred: !design.starred }
                    : design,
            ),
        );
    };

    const deleteDesign = (id: string) => {
        setDesigns(designs.filter(design => design.id !== id));
    };

    // Filter designs based on search query
    const filteredDesigns = designs.filter(design =>
        design.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sort designs
    const sortedDesigns = [...filteredDesigns].sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'createdAt') {
            return (
                Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
            );
        } else if (sortBy === 'lastModified') {
            return (
                Number(new Date(b.lastModified)) -
                Number(new Date(a.lastModified))
            );
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
            {/* Top profile section */}
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
                                {dict.account?.designsCount || 'Designs'}:{' '}
                                {designs.length}
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

            {/* Success/Error messages */}
            {success && (
                <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded-md animate-fadeIn flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{success}</span>
                    </div>
                </div>
            )}

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
                                        className={`mr-3 h-5 w-5 ${activeTab === 'profile' ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'}`}
                                    />
                                    <span className="font-medium">
                                        {dict.account?.profileTab || 'Profile'}
                                    </span>
                                    <ChevronRight
                                        className={`ml-auto h-5 w-5 ${activeTab === 'profile' ? 'text-purple-500' : 'text-gray-400'}`}
                                    />
                                </button>

                                <button
                                    onClick={() => setActiveTab('designs')}
                                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                                        activeTab === 'designs'
                                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}>
                                    <ImageIcon
                                        className={`mr-3 h-5 w-5 ${activeTab === 'designs' ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'}`}
                                    />
                                    <span className="font-medium">
                                        {dict.account?.designsTab ||
                                            'My Designs'}
                                    </span>
                                    <ChevronRight
                                        className={`ml-auto h-5 w-5 ${activeTab === 'designs' ? 'text-purple-500' : 'text-gray-400'}`}
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
                                        className={`mr-3 h-5 w-5 ${activeTab === 'security' ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'}`}
                                    />
                                    <span className="font-medium">
                                        {dict.account?.securityTab ||
                                            'Security'}
                                    </span>
                                    <ChevronRight
                                        className={`ml-auto h-5 w-5 ${activeTab === 'security' ? 'text-purple-500' : 'text-gray-400'}`}
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

                        {/* Designs tab */}
                        {activeTab === 'designs' && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {dict.account?.myDesigns ||
                                            'My Designs'}
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={
                                                    dict.account
                                                        ?.searchDesigns ||
                                                    'Search designs...'
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
                                                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
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
                                                className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
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
                                            <option value="lastModified">
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
                                        <Link
                                            href={`/${lang}/editor/new`}
                                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center shadow-sm hover:shadow">
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            {dict.account?.newDesign ||
                                                'New Design'}
                                        </Link>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {sortedDesigns.length === 0 ? (
                                        <div className="text-center py-12">
                                            <ImageIcon className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
                                            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                                                {searchQuery
                                                    ? dict.account
                                                          ?.noDesignsFound ||
                                                      'No designs found'
                                                    : dict.account
                                                          ?.noDesignsYet ||
                                                      'No designs yet'}
                                            </h3>
                                            <p className="mt-1 text-gray-500 dark:text-gray-400">
                                                {searchQuery
                                                    ? dict.account
                                                          ?.tryDifferentSearch ||
                                                      'Try a different search term'
                                                    : dict.account
                                                          ?.getStartedWithDesign ||
                                                      'Get started by creating a new design'}
                                            </p>
                                            {!searchQuery && (
                                                <div className="mt-6">
                                                    <Link
                                                        href={`/${lang}/editor/new`}
                                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center shadow-sm hover:shadow">
                                                        <PlusCircle className="mr-2 h-5 w-5" />
                                                        {dict.account
                                                            ?.createFirstDesign ||
                                                            'Create your first design'}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    ) : viewMode === 'grid' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {sortedDesigns.map(design => (
                                                <div
                                                    key={design.id}
                                                    className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                                                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-600 overflow-hidden">
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                            <ImageIcon className="h-8 w-8" />
                                                        </div>
                                                        {/* This would be a real image in production */}
                                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-orange-400/20 group-hover:opacity-80 transition-opacity duration-300"></div>

                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <button
                                                                onClick={() =>
                                                                    toggleStarDesign(
                                                                        design.id,
                                                                    )
                                                                }
                                                                className={`p-1 rounded-full shadow-sm ${design.starred ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500 hover:text-yellow-500'}`}
                                                                title={
                                                                    design.starred
                                                                        ? dict
                                                                              .account
                                                                              ?.unstar ||
                                                                          'Unstar'
                                                                        : dict
                                                                              .account
                                                                              ?.star ||
                                                                          'Star'
                                                                }>
                                                                <Star className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                                    {
                                                                        design.name
                                                                    }
                                                                </h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                    {design.lastModified.toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <Link
                                                                    href={`/${lang}/editor/${design.id}`}
                                                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                                                    title={
                                                                        dict
                                                                            .account
                                                                            ?.editDesign ||
                                                                        'Edit design'
                                                                    }>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() =>
                                                                        deleteDesign(
                                                                            design.id,
                                                                        )
                                                                    }
                                                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                                    title={
                                                                        dict
                                                                            .account
                                                                            ?.deleteDesign ||
                                                                        'Delete design'
                                                                    }>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                                                                {design.type}
                                                            </span>
                                                            {design.starred && (
                                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                                                                    <Star className="h-3 w-3 mr-1" />
                                                                    {dict
                                                                        .account
                                                                        ?.starred ||
                                                                        'Starred'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        href={`/${lang}/editor/${design.id}`}
                                                        className="absolute inset-0 z-10 focus:outline-none"
                                                        aria-label={`Edit ${design.name}`}>
                                                        <span className="sr-only">
                                                            {dict.account
                                                                ?.editDesign ||
                                                                'Edit design'}
                                                        </span>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {sortedDesigns.map(design => (
                                                <div
                                                    key={design.id}
                                                    className="py-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-750 px-2 rounded-lg transition-colors duration-200">
                                                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-600 rounded overflow-hidden relative mr-4">
                                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                            <ImageIcon className="h-6 w-6" />
                                                        </div>
                                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-orange-400/20"></div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                                {design.name}
                                                            </h3>
                                                            <div className="ml-4 flex-shrink-0 flex space-x-2">
                                                                <button
                                                                    onClick={() =>
                                                                        toggleStarDesign(
                                                                            design.id,
                                                                        )
                                                                    }
                                                                    className={`p-1 rounded-full ${design.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                                                    title={
                                                                        design.starred
                                                                            ? dict
                                                                                  .account
                                                                                  ?.unstar ||
                                                                              'Unstar'
                                                                            : dict
                                                                                  .account
                                                                                  ?.star ||
                                                                              'Star'
                                                                    }>
                                                                    <Star className="h-4 w-4" />
                                                                </button>
                                                                <Link
                                                                    href={`/${lang}/editor/${design.id}`}
                                                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                                                                    title={
                                                                        dict
                                                                            .account
                                                                            ?.editDesign ||
                                                                        'Edit design'
                                                                    }>
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() =>
                                                                        deleteDesign(
                                                                            design.id,
                                                                        )
                                                                    }
                                                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                                    title={
                                                                        dict
                                                                            .account
                                                                            ?.deleteDesign ||
                                                                        'Delete design'
                                                                    }>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                                                            <span className="inline-flex items-center">
                                                                <Clock className="h-3.5 w-3.5 mr-1" />
                                                                {design.lastModified.toLocaleDateString()}
                                                            </span>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                                                                {design.type}
                                                            </span>
                                                            {design.starred && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                                                                    <Star className="h-3 w-3 mr-1" />
                                                                    {dict
                                                                        .account
                                                                        ?.starred ||
                                                                        'Starred'}
                                                                </span>
                                                            )}
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
