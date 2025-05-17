'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Paintbrush, AlertCircle } from 'lucide-react';
import { useAuth, useDictionary } from '@/contexts';

export const ResetPasswordForm = () => {
    const { resetPassword } = useAuth();
    const { dict, lang } = useDictionary();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await resetPassword(email);

            // Store email in localStorage for resend functionality
            localStorage.setItem('resetPasswordEmail', email);
            router.push(`/${lang}/verify-reset-password`);
        } catch {
            setError(
                dict.auth?.errors?.generic ||
                    'Something went wrong. Please try again later.',
            );
        } finally {
            setIsSubmitting(false);
        }
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
                        {dict.auth?.resetPassword?.title ||
                            'Reset your password'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {dict.auth?.resetPassword?.subtitle ||
                            'Enter your email to receive a password reset link'}{' '}
                        <Link
                            href={`/${lang}/login`}
                            className="font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors duration-200">
                            {dict.auth?.resetPassword?.loginLink ||
                                'Back to login'}
                        </Link>
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg text-sm border-l-4 border-red-500 flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {dict.auth?.resetPassword?.email || 'Email address'}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder={
                                dict.auth?.resetPassword?.enterEmail ||
                                'Enter your email address'
                            }
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg mt-4">
                        {isSubmitting
                            ? dict.auth?.resetPassword?.loading || 'Sending...'
                            : dict.auth?.resetPassword?.submit ||
                              'Send reset link'}
                    </button>
                </form>
            </main>
        </div>
    );
};
