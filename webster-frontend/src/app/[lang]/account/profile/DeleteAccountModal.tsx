'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import { AlertTriangle } from 'lucide-react';
import { API_URL } from '@/config';

export default function DeleteAccountModal({
    onClose,
}: {
    onClose: () => void;
}) {
    const { dict, lang } = useDictionary();
    const { user, token, logout } = useAuth();
    const router = useRouter();

    const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
    const [error, setError] = useState('');

    const handleDeleteAccount = async () => {
        if (!user || deleteAccountConfirm !== user.username) {
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
            await logout();
            router.push(`/${lang}/login`);
        } catch {
            setError(
                dict.account?.deleteAccountError || 'Failed to delete account',
            );
        }
    };

    if (!user) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title">
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-gray-500/30 dark:bg-gray-900/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>

                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3
                                className="text-lg font-medium text-gray-900 dark:text-white"
                                id="modal-title">
                                {dict.account?.deleteAccountTitle ||
                                    'Delete account'}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                {dict.account?.deleteAccountDescription ||
                                    'Are you sure you want to delete your account? This action cannot be undone.'}
                            </p>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            )}
                            <div className="mt-4">
                                <label
                                    htmlFor="confirm-delete"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {(
                                        dict.account?.deleteAccountConfirm ||
                                        `Type "${user.username}" to confirm`
                                    ).replace('{username}', user.username)}
                                </label>
                                <input
                                    type="text"
                                    id="confirm-delete"
                                    placeholder={
                                        dict.account
                                            ?.deleteAccountPlaceholder ||
                                        `Enter your username`
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    value={deleteAccountConfirm}
                                    onChange={e =>
                                        setDeleteAccountConfirm(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleDeleteAccount}
                        disabled={deleteAccountConfirm !== user.username}>
                        {dict.account?.deleteAccountButton || 'Delete account'}
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onClose}>
                        {dict.account?.cancel || 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
}
