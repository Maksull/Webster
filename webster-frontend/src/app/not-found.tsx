import { i18n, Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function NotFound() {
    // Initialize with default locale
    let lang: Locale = i18n.defaultLocale;

    // Get the headers
    const headersList = await headers();

    // Check for the locale from our custom middleware header
    const localeFromHeader = headersList.get('x-next-locale');

    if (localeFromHeader && i18n.locales.includes(localeFromHeader as Locale)) {
        lang = localeFromHeader as Locale;
    }

    const dictionary = await getDictionary(lang);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
            <div className="text-center max-w-md">
                {/* 404 Number */}
                <div className="relative mb-6">
                    <h1 className="text-9xl font-extrabold text-gray-800 select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            404
                        </span>
                    </div>
                </div>

                {/* Title and Description */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {dictionary?.notFound?.title || 'Page not found'}
                </h2>
                <p className="text-gray-300 mb-8">
                    {dictionary?.notFound?.description ||
                        'Could not find the requested page'}
                </p>

                {/* Back to Home Button */}
                <Link
                    href={`/${lang}`}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
                    {dictionary?.notFound?.backHome || 'Back to home'}
                </Link>
            </div>
        </div>
    );
}
