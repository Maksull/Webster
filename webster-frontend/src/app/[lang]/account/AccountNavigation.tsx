'use client';

import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    User,
    ImageIcon,
    Lock,
    LogOut,
    ChevronRight,
    File,
} from 'lucide-react';

export default function AccountNavigation() {
    const { dict, lang } = useDictionary();
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return (
            pathname === `/${lang}/account/${path}` ||
            (path === 'profile' && pathname === `/${lang}/account`)
        );
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push(`/${lang}/login`);
        } catch {}
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sticky top-8">
            <nav className="space-y-1">
                <Link
                    href={`/${lang}/account/profile`}
                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                        isActive('profile')
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    <User
                        className={`mr-3 h-5 w-5 ${
                            isActive('profile')
                                ? 'text-purple-500'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    />
                    <span className="font-medium">
                        {dict.account?.profileTab || 'Profile'}
                    </span>
                    <ChevronRight
                        className={`ml-auto h-5 w-5 ${
                            isActive('profile')
                                ? 'text-purple-500'
                                : 'text-gray-400'
                        }`}
                    />
                </Link>

                <Link
                    href={`/${lang}/account/canvases`}
                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                        isActive('canvases')
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    <ImageIcon
                        className={`mr-3 h-5 w-5 ${
                            isActive('canvases')
                                ? 'text-purple-500'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    />
                    <span className="font-medium">
                        {dict.account?.canvasesTab || 'My Canvases'}
                    </span>
                    <ChevronRight
                        className={`ml-auto h-5 w-5 ${
                            isActive('canvases')
                                ? 'text-purple-500'
                                : 'text-gray-400'
                        }`}
                    />
                </Link>

                <Link
                    href={`/${lang}/account/templates`}
                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                        isActive('templates')
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    <File
                        className={`mr-3 h-5 w-5 ${
                            isActive('templates')
                                ? 'text-purple-500'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    />
                    <span className="font-medium">
                        {dict.account?.templatesTab || 'My Templates'}
                    </span>
                    <ChevronRight
                        className={`ml-auto h-5 w-5 ${
                            isActive('templates')
                                ? 'text-purple-500'
                                : 'text-gray-400'
                        }`}
                    />
                </Link>

                <Link
                    href={`/${lang}/account/security`}
                    className={`flex items-center px-3 py-2 w-full text-left rounded-lg transition-colors duration-200 ${
                        isActive('security')
                            ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}>
                    <Lock
                        className={`mr-3 h-5 w-5 ${
                            isActive('security')
                                ? 'text-purple-500'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                    />
                    <span className="font-medium">
                        {dict.account?.securityTab || 'Security'}
                    </span>
                    <ChevronRight
                        className={`ml-auto h-5 w-5 ${
                            isActive('security')
                                ? 'text-purple-500'
                                : 'text-gray-400'
                        }`}
                    />
                </Link>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                    <button
                        onClick={handleLogout}
                        className="cursor-pointer flex items-center px-3 py-2 w-full text-left rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">
                            {dict.account?.logout || 'Logout'}
                        </span>
                    </button>
                </div>
            </nav>
        </div>
    );
}
