'use client';

import { useEffect, useState } from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

export default function SecuritySettings() {
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const { changePassword, changeEmail } = useAuth();

    const [error, setError] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showEmailPassword, setShowEmailPassword] = useState(false);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [emailPassword, setEmailPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const getPasswordStrengthLabel = () => {
        if (passwordStrength <= 1) return dict.auth?.passwordWeak || 'Weak';
        if (passwordStrength <= 2) return dict.auth?.passwordFair || 'Fair';
        if (passwordStrength <= 4) return dict.auth?.passwordGood || 'Good';
        return dict.auth?.passwordStrong || 'Strong';
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 2) return 'bg-orange-500';
        if (passwordStrength <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    useEffect(() => {
        if (!newPassword) {
            setPasswordStrength(0);
            return;
        }
        let strength = 0;
        if (newPassword.length >= 8) strength += 1;
        if (/[A-Z]/.test(newPassword)) strength += 1;
        if (/[a-z]/.test(newPassword)) strength += 1;
        if (/[0-9]/.test(newPassword)) strength += 1;
        if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;
        setPasswordStrength(strength);
    }, [newPassword]);

    const handleChangePassword = async () => {
        try {
            await changePassword(currentPassword, newPassword);
            setShowPasswordModal(false);
            setError(null);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    const handleChangeEmail = async () => {
        try {
            await changeEmail(emailPassword, newEmail);
            setShowEmailModal(false);
            setError(null);
            setTimeout(() => {
                router.push(`/${lang}/verify-email-change`);
            }, 500);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {dict.account?.security || 'Security'}
                </h2>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {dict.account?.changePassword || 'Change Password'}
                    </h3>

                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                        <Lock className="mr-2 h-4 w-4" />
                        {dict.account?.changePassword || 'Change Password'}
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {dict.account?.changeEmail || 'Change Email'}
                    </h3>

                    <button
                        onClick={() => setShowEmailModal(true)}
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                        <Mail className="mr-2 h-4 w-4" />
                        {dict.account?.changeEmail || 'Change Email'}
                    </button>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-0"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-gray-500/30 dark:bg-gray-900/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowPasswordModal(false)}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
                        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="text-center sm:text-left">
                                <h3
                                    className="text-lg font-medium text-gray-900 dark:text-white"
                                    id="modal-title">
                                    {dict.account?.changePassword ||
                                        'Change Password'}
                                </h3>
                                {error && (
                                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border-l-4 border-red-500 animate-fadeIn">
                                        <div className="flex">
                                            <span className="flex-shrink-0">
                                                <AlertCircle
                                                    className="h-5 w-5 text-red-400"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <p className="ml-3 text-sm font-medium text-red-800 dark:text-red-200">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 space-y-4">
                                    <label
                                        htmlFor="current-password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {dict.account?.currentPassword ||
                                            'Current Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="current-password"
                                            type={
                                                showCurrentPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder={
                                                dict.account?.currentPassword ||
                                                'Current Password'
                                            }
                                            value={currentPassword}
                                            onChange={e =>
                                                setCurrentPassword(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() =>
                                                setShowCurrentPassword(
                                                    !showCurrentPassword,
                                                )
                                            }
                                            aria-label={
                                                showCurrentPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }>
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                            )}
                                        </button>
                                    </div>

                                    <label
                                        htmlFor="new-password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {dict.account?.newPassword ||
                                            'New Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new-password"
                                            type={
                                                showNewPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder={
                                                dict.account?.newPassword ||
                                                'New Password'
                                            }
                                            value={newPassword}
                                            onChange={e =>
                                                setNewPassword(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    !showNewPassword,
                                                )
                                            }
                                            aria-label={
                                                showNewPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }>
                                            {showNewPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                    {/* Password strength indicator */}
                                    {newPassword && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                    {dict.auth
                                                        ?.passwordStrength ||
                                                        'Password Strength'}
                                                    :
                                                </span>
                                                <span
                                                    className={`text-xs font-medium ${
                                                        passwordStrength <= 1
                                                            ? 'text-red-500'
                                                            : passwordStrength <=
                                                                2
                                                              ? 'text-orange-500'
                                                              : passwordStrength <=
                                                                  4
                                                                ? 'text-yellow-500'
                                                                : 'text-green-500'
                                                    }`}>
                                                    {getPasswordStrengthLabel()}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                                    style={{
                                                        width: `${(passwordStrength / 5) * 100}%`,
                                                    }}
                                                    role="progressbar"
                                                    aria-valuenow={
                                                        passwordStrength
                                                    }
                                                    aria-valuemin={0}
                                                    aria-valuemax={5}
                                                    aria-label="Password strength indicator"
                                                />
                                            </div>

                                            <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                <li
                                                    className={`flex items-center ${
                                                        newPassword.length >= 8
                                                            ? 'text-green-500'
                                                            : ''
                                                    }`}>
                                                    <span className="mr-1">
                                                        {newPassword.length >= 8
                                                            ? '✓'
                                                            : '○'}
                                                    </span>
                                                    {dict.auth
                                                        ?.passwordMinLength ||
                                                        'At least 8 characters'}
                                                </li>
                                                <li
                                                    className={`flex items-center ${
                                                        /[A-Z]/.test(
                                                            newPassword,
                                                        )
                                                            ? 'text-green-500'
                                                            : ''
                                                    }`}>
                                                    <span className="mr-1">
                                                        {/[A-Z]/.test(
                                                            newPassword,
                                                        )
                                                            ? '✓'
                                                            : '○'}
                                                    </span>
                                                    {dict.auth
                                                        ?.passwordUppercase ||
                                                        'At least one uppercase letter'}
                                                </li>
                                                <li
                                                    className={`flex items-center ${
                                                        /[a-z]/.test(
                                                            newPassword,
                                                        )
                                                            ? 'text-green-500'
                                                            : ''
                                                    }`}>
                                                    <span className="mr-1">
                                                        {/[a-z]/.test(
                                                            newPassword,
                                                        )
                                                            ? '✓'
                                                            : '○'}
                                                    </span>
                                                    {dict.auth
                                                        ?.passwordLowercase ||
                                                        'At least one lowercase letter'}
                                                </li>
                                                <li
                                                    className={`flex items-center ${
                                                        /[0-9]/.test(
                                                            newPassword,
                                                        )
                                                            ? 'text-green-500'
                                                            : ''
                                                    }`}>
                                                    <span className="mr-1">
                                                        {/[0-9]/.test(
                                                            newPassword,
                                                        )
                                                            ? '✓'
                                                            : '○'}
                                                    </span>
                                                    {dict.auth
                                                        ?.passwordNumber ||
                                                        'At least one number'}
                                                </li>
                                                <li
                                                    className={`flex items-center ${
                                                        /[^A-Za-z0-9]/.test(
                                                            newPassword,
                                                        )
                                                            ? 'text-green-500'
                                                            : ''
                                                    }`}>
                                                    <span className="mr-1">
                                                        {/[^A-Za-z0-9]/.test(
                                                            newPassword,
                                                        )
                                                            ? '✓'
                                                            : '○'}
                                                    </span>
                                                    {dict.auth?.specialSymbol ||
                                                        'At least one special symbol'}
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                className="cursor-pointer w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                {dict.account?.save || 'Save'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(false)}
                                className="cursor-pointer mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                {dict.account?.cancel || 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Email Modal */}
            {showEmailModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:p-0"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-gray-500/30 dark:bg-gray-900/30 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowEmailModal(false)}
                        aria-hidden="true"
                    />

                    {/* Modal */}
                    <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
                        <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="text-center sm:text-left">
                                <h3
                                    className="text-lg font-medium text-gray-900 dark:text-white"
                                    id="modal-title">
                                    {dict.account?.changeEmail ||
                                        'Change Email'}
                                </h3>
                                {error && (
                                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border-l-4 border-red-500 animate-fadeIn">
                                        <div className="flex">
                                            <span className="flex-shrink-0">
                                                <AlertCircle
                                                    className="h-5 w-5 text-red-400"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <p className="ml-3 text-sm font-medium text-red-800 dark:text-red-200">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="mt-4 space-y-4">
                                    <label
                                        htmlFor="email-password"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {dict.account?.currentPassword ||
                                            'Current Password'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email-password"
                                            type={
                                                showEmailPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            placeholder={
                                                dict.account?.currentPassword ||
                                                'Current Password'
                                            }
                                            value={emailPassword}
                                            onChange={e =>
                                                setEmailPassword(e.target.value)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <button
                                            type="button"
                                            className="cursor-pointer absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() =>
                                                setShowEmailPassword(
                                                    !showEmailPassword,
                                                )
                                            }
                                            aria-label={
                                                showEmailPassword
                                                    ? 'Hide password'
                                                    : 'Show password'
                                            }>
                                            {showEmailPassword ? (
                                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                            ) : (
                                                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                            )}
                                        </button>
                                    </div>
                                    <label
                                        htmlFor="new-email"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {dict.account?.newEmail || 'New Email'}
                                    </label>
                                    <input
                                        id="new-email"
                                        type="email"
                                        placeholder={
                                            dict.account?.newEmail ||
                                            'New Email'
                                        }
                                        value={newEmail}
                                        onChange={e =>
                                            setNewEmail(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                onClick={handleChangeEmail}
                                className="cursor-pointer w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                {dict.account?.change || 'Change'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowEmailModal(false)}
                                className="cursor-pointer mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                {dict.account?.cancel || 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
