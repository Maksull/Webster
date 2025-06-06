'use client';

import { Paintbrush } from 'lucide-react';
import { useDictionary } from '@/contexts/DictionaryContext';

export function Footer() {
    const { dict } = useDictionary();

    return (
        <footer className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 w-full transition-colors duration-300">
            <div className="w-full">
                <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-6">
                            <Paintbrush className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            <span className="text-xl font-semibold text-gray-900 dark:text-white">
                                {dict.footer.brand}
                            </span>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 w-full">
                            <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                                {dict.footer.description}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                        <p className="text-sm text-center text-gray-400 dark:text-gray-500">
                            {dict.footer.copyright.replace(
                                '{year}',
                                new Date().getFullYear().toString(),
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
