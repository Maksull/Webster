'use client';

import Link from 'next/link';
import { useDictionary } from '@/contexts/DictionaryContext';
import { Lock } from 'lucide-react';

export default function SecuritySettings() {
    const { dict, lang } = useDictionary();

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

                    <Link
                        href={`/${lang}/reset-password`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                        <Lock className="mr-2 h-4 w-4" />
                        {dict.account?.changePassword || 'Change Password'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
