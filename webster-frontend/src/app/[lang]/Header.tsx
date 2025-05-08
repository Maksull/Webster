'use client';

import {
    Paintbrush,
    Menu,
    X,
    User,
    LogIn,
    UserPlus,
    LogOut,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggler } from './LanguageToggler';
import { ThemeToggle } from './ThemeToggle';
import { API_URL } from '@/config';

export function Header() {
    const { dict, lang } = useDictionary();
    const { isAuthenticated, isLoading, user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-white dark:bg-gray-900 shadow-md transition-colors duration-300">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link
                            href={`/${lang}`}
                            className="flex-shrink-0 flex items-center">
                            <Paintbrush className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <span className="ml-2 text-2xl font-bold dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
                                {dict.header?.brand || 'Webster'}
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

                            <LanguageToggler currentLang={lang} />
                            <ThemeToggle />

                            {!isLoading && (
                                <>
                                    {isAuthenticated ? (
                                        <div className="flex items-center pl-3">
                                            <Link
                                                href={`/${lang}/account`}
                                                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none">
                                                <span className="mr-2 text-sm font-medium">
                                                    {user?.firstName}
                                                </span>
                                                <div className="flex">
                                                    {user?.avatar ? (
                                                        <Image
                                                            src={`${API_URL}/public/img/users/${user.avatar}`}
                                                            alt={
                                                                user.username ||
                                                                'User avatar'
                                                            }
                                                            width={32}
                                                            height={32}
                                                            className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-100 dark:ring-purple-900"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="ml-4 flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
                                                <LogOut className="h-4 w-4 mr-1" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Link
                                                href={`/${lang}/login`}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200">
                                                <LogIn className="h-4 w-4 mr-1" />
                                                {dict.header?.login || 'Login'}
                                            </Link>
                                            <Link
                                                href={`/${lang}/register`}
                                                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md shadow-sm hover:shadow-md transition-all duration-200">
                                                <UserPlus className="h-4 w-4 mr-1" />
                                                {dict.header?.register ||
                                                    'Register'}
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="sm:hidden flex items-center space-x-1">
                            <LanguageToggler currentLang={lang} />
                            <ThemeToggle />

                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                                aria-controls="mobile-menu"
                                aria-expanded={isMenuOpen}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? (
                                    <X
                                        className="block h-6 w-6"
                                        aria-hidden="true"
                                    />
                                ) : (
                                    <Menu
                                        className="block h-6 w-6"
                                        aria-hidden="true"
                                    />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div className="sm:hidden" id="mobile-menu">
                    <div className="pt-4 pb-3 space-y-1">
                        {!isLoading && (
                            <>
                                {isAuthenticated ? (
                                    <>
                                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                                                    {user?.avatar ? (
                                                        <Image
                                                            src={user.avatar}
                                                            alt={
                                                                user.username ||
                                                                'User avatar'
                                                            }
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full"
                                                        />
                                                    ) : (
                                                        <User className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <span className="ml-2 font-medium text-gray-700 dark:text-gray-200">
                                                    {user?.firstName}{' '}
                                                    {user?.lastName}
                                                </span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/${lang}/account`}
                                            className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={() =>
                                                setIsMenuOpen(false)
                                            }>
                                            <User className="inline h-5 w-5 mr-1" />
                                            {dict.header?.account || 'Account'}
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full text-left block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                                            <LogOut className="inline h-5 w-5 mr-1" />
                                            {dict.header?.logout || 'Logout'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={`/${lang}/login`}
                                            className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={() =>
                                                setIsMenuOpen(false)
                                            }>
                                            <LogIn className="inline h-5 w-5 mr-1" />
                                            {dict.header?.login || 'Login'}
                                        </Link>
                                        <Link
                                            href={`/${lang}/register`}
                                            className="block px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-purple-900"
                                            onClick={() =>
                                                setIsMenuOpen(false)
                                            }>
                                            <UserPlus className="inline h-5 w-5 mr-1" />
                                            {dict.header?.register ||
                                                'Register'}
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
