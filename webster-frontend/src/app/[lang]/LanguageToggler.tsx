'use client';

import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { i18n } from '@/i18n-config';

interface LanguageTogglerProps {
    currentLang: string;
}

export function LanguageToggler({ currentLang }: LanguageTogglerProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Get the path without the language prefix
    const pathnameWithoutLang = pathname?.split('/').slice(2).join('/') || '';

    return (
        <div className="flex items-center justify-center md:gap-2">
            <Globe className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <div className="flex">
                {i18n.locales.map(locale => (
                    <button
                        key={locale}
                        type="button"
                        onClick={() =>
                            router.push(`/${locale}/${pathnameWithoutLang}`)
                        }
                        className={`px-3 py-1 rounded-lg hover:bg-indigo-200 cursor-pointer ${
                            currentLang === locale
                                ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-800 dark:hover:text-white'
                                : 'text-gray-600 dark:text-gray-400 dark:hover:bg-indigo-800 dark:hover:text-white'
                        }`}>
                        {locale.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}
