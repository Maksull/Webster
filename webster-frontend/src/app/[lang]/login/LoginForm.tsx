'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import { LogIn, AlertCircle, Eye, EyeOff, Paintbrush } from 'lucide-react';

export const LoginForm = () => {
    const { login } = useAuth();
    const { dict, lang } = useDictionary();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(username, password);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    dict.auth?.loginFailed || 'Login failed. Please try again.',
                );
            }
        } finally {
            setIsLoading(false);
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

            <main className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 transition-all duration-300 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 z-10 border border-gray-100 dark:border-gray-700">
                <div className="form-heading text-center">
                    <div className="flex justify-center">
                        <span className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                            <Paintbrush className="h-10 w-10 text-white" />
                        </span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                        {dict.auth?.loginTitle || 'Sign in to your account'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {dict.auth?.loginSubtitle || 'Or'}{' '}
                        <Link
                            href={`/${lang}/register`}
                            className="font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors duration-200">
                            {dict.auth?.registerLink || 'Create an account'}
                        </Link>
                    </p>
                </div>

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

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <fieldset className="space-y-5">
                        <label className="block" htmlFor="username">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.auth?.usernameLabel || 'Username'}
                            </span>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
                                placeholder={
                                    dict.auth?.usernamePlaceholder ||
                                    'Enter your username'
                                }
                            />
                        </label>

                        <label className="block" htmlFor="password">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {dict.auth?.passwordLabel || 'Password'}
                            </span>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm pr-10 shadow-sm"
                                    placeholder="********"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    tabIndex={-1}
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
                        </label>
                    </fieldset>

                    <div className="flex justify-end">
                        <Link
                            href={`/${lang}/reset-password`}
                            className="text-sm font-medium text-purple-600 hover:text-pink-600 dark:text-purple-400 dark:hover:text-pink-400 transition-colors duration-200">
                            {dict.auth?.forgotPassword ||
                                'Forgot your password?'}
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="cursor-pointer group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg">
                        {isLoading ? (
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </span>
                        ) : (
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <LogIn
                                    className="h-5 w-5 text-purple-200 group-hover:text-white transition-colors duration-200"
                                    aria-hidden="true"
                                />
                            </span>
                        )}
                        {isLoading
                            ? dict.auth?.loggingIn || 'Signing in...'
                            : dict.auth?.loginButton || 'Sign in'}
                    </button>
                </form>
            </main>
        </div>
    );
};
