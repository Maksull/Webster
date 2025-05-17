'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Paintbrush,
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
} from 'lucide-react';
import { useAuth, useDictionary } from '@/contexts';

export const SetNewPasswordForm = () => {
    const { resetPasswordWithToken } = useAuth();
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [passwordStrength, setPasswordStrength] = useState(0);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long.');
            setIsSubmitting(false);
            return;
        }

        try {
            if (!token) {
                setError('Invalid or missing token. Please try again.');
                setIsSubmitting(false);
                return;
            }

            await resetPasswordWithToken(token, newPassword);
            setSuccess(true);
            setTimeout(() => router.push(`/${lang}/login`), 1500);
        } catch {
            setError(
                dict.auth?.errors?.generic ||
                    'Something went wrong. Please try again later.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full blur-3xl"></div>
                <div className="absolute top-1/3 -right-24 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-indigo-200 dark:bg-indigo-900 rounded-full blur-3xl"></div>
            </div>

            <main className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-all duration-300 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 z-10 border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="flex justify-center">
                        <span className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <Paintbrush className="h-10 w-10 text-white" />
                        </span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                        {dict.auth?.resetPassword?.newPasswordTitle ||
                            'Set new password'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {dict.auth?.resetPassword?.subtitle ||
                            'Enter your new password to complete the reset process'}{' '}
                        <Link
                            href={`/${lang}/login`}
                            className="font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors duration-200">
                            {dict.auth?.resetPassword?.loginLink ||
                                'Back to login'}
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg text-sm border-l-4 border-red-500 flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200 rounded-lg text-sm border-l-4 border-green-500 flex items-start animate-pulse">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                            {dict.auth?.resetPassword?.newPasswordSuccess ||
                                'Your password has been successfully updated! Redirecting to login...'}
                        </span>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {dict.auth?.resetPassword?.newPasswordField ||
                                'New Password'}
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={newPassword}
                                placeholder={
                                    dict.auth?.resetPassword
                                        ?.enterNewPassword ||
                                    'Enter your new password'
                                }
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }>
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" />
                                )}
                            </button>
                        </div>
                    </div>

                    {newPassword && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {dict.auth?.passwordStrength ||
                                        'Password Strength'}
                                    :
                                </span>
                                <span
                                    className={`text-xs font-medium ${
                                        passwordStrength <= 1
                                            ? 'text-red-500'
                                            : passwordStrength <= 2
                                              ? 'text-orange-500'
                                              : passwordStrength <= 4
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
                                    aria-valuenow={passwordStrength}
                                    aria-valuemin={0}
                                    aria-valuemax={5}
                                    aria-label="Password strength indicator"
                                />
                            </div>

                            <ul className="mt-3 text-xs text-gray-600 dark:text-gray-400 space-y-1.5 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                <li
                                    className={`flex items-center ${newPassword.length >= 8 ? 'text-green-500' : ''}`}>
                                    <span className="mr-1.5 flex-shrink-0">
                                        {newPassword.length >= 8 ? '✓' : '○'}
                                    </span>
                                    {dict.auth?.passwordMinLength ||
                                        'At least 8 characters'}
                                </li>
                                <li
                                    className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-500' : ''}`}>
                                    <span className="mr-1.5 flex-shrink-0">
                                        {/[A-Z]/.test(newPassword) ? '✓' : '○'}
                                    </span>
                                    {dict.auth?.passwordUppercase ||
                                        'At least one uppercase letter'}
                                </li>
                                <li
                                    className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-500' : ''}`}>
                                    <span className="mr-1.5 flex-shrink-0">
                                        {/[a-z]/.test(newPassword) ? '✓' : '○'}
                                    </span>
                                    {dict.auth?.passwordLowercase ||
                                        'At least one lowercase letter'}
                                </li>
                                <li
                                    className={`flex items-center ${/[0-9]/.test(newPassword) ? 'text-green-500' : ''}`}>
                                    <span className="mr-1.5 flex-shrink-0">
                                        {/[0-9]/.test(newPassword) ? '✓' : '○'}
                                    </span>
                                    {dict.auth?.passwordNumber ||
                                        'At least one number'}
                                </li>
                                <li
                                    className={`flex items-center ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-500' : ''}`}>
                                    <span className="mr-1.5 flex-shrink-0">
                                        {/[^A-Za-z0-9]/.test(newPassword)
                                            ? '✓'
                                            : '○'}
                                    </span>
                                    {dict.auth?.specialSymbol ||
                                        'At least one special symbol'}
                                </li>
                            </ul>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || success}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg mt-4">
                        {isSubmitting
                            ? dict.auth?.resetPassword?.loading || 'Updating...'
                            : dict.auth?.resetPassword?.submitReset ||
                              'Set New Password'}
                    </button>
                </form>
            </main>
        </div>
    );
};
