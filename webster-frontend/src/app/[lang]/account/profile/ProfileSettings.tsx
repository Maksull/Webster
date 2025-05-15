'use client';
import { useState, useEffect } from 'react';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useStatus } from '@/contexts/StatusContext';
import DeleteAccountModal from './DeleteAccountModal';

export default function ProfileSettings() {
    const { dict } = useDictionary();
    const { user, updateUser } = useAuth();
    const { showStatus } = useStatus();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                username: user.username || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateUser({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                username: profileData.username,
            });
            setIsEditing(false);
            showStatus(
                'success',
                dict.account?.profileUpdateSuccess ||
                    'Profile updated successfully',
            );
        } catch {
            showStatus(
                'error',
                dict.account?.profileUpdateError || 'Failed to update profile',
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {dict.account?.profileSettings || 'Profile Settings'}
                </h2>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg font-medium flex items-center transition-colors duration-200 hover:bg-purple-100 dark:hover:bg-purple-900/50">
                        <Edit2 className="mr-2 h-4 w-4" />
                        {dict.account?.editProfile || 'Edit Profile'}
                    </button>
                ) : (
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                            {dict.account?.cancel || 'Cancel'}
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-70 flex items-center">
                            {isSaving ? (
                                <>
                                    <span className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    {dict.account?.saving || 'Saving...'}
                                </>
                            ) : (
                                dict.account?.saveChanges || 'Save Changes'
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile form */}
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {dict.account?.firstName || 'First Name'}
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={profileData.firstName}
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
                            {dict.account?.lastName || 'Last Name'}
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
                            {dict.account?.username || 'Username'}
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
                                {dict.account?.emailNotVerified ||
                                    'Email not verified'}
                                <button className="ml-2 text-purple-600 dark:text-purple-400 hover:underline">
                                    {dict.account?.verifyNow || 'Verify now'}
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
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 flex items-center">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {dict.account?.deleteAccount || 'Delete Account'}
                    </button>

                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {dict.account?.deleteAccountWarning ||
                            'This action cannot be undone. All your data will be permanently deleted.'}
                    </p>
                </div>
            </div>

            {/* Delete account modal */}
            {showDeleteModal && (
                <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
            )}
        </div>
    );
}
