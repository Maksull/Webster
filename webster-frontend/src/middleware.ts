import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// Note: For localStorage-based auth, we can't protect routes in middleware directly
// since middleware runs on the server and doesn't have access to client localStorage.
// Route protection should be handled in the React components themselves.

function getLocale(request: NextRequest): string | undefined {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const locales: readonly string[] = i18n.locales;

    // Use negotiator and intl-localematcher to get best locale
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages([
        ...locales,
    ]);

    const locale = matchLocale(languages, locales, i18n.defaultLocale);

    return locale;
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Files in public folder should be allowed to pass through
    if (
        ['/manifest.json', '/favicon.ico', '/sounds/notification.wav'].includes(
            pathname,
        )
    ) {
        return NextResponse.next();
    }

    // Check if there is any supported locale in the pathname
    const pathnameHasLocale = i18n.locales.some(
        locale =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (pathnameHasLocale) {
        // Extract the locale from the pathname
        const segments = pathname.split('/').filter(Boolean);
        const localeFromPath = segments[0];

        // Create the response and set custom headers with path info
        const response = NextResponse.next();

        // Set custom header with the detected locale
        response.headers.set('x-next-locale', localeFromPath);

        // Set custom header with full pathname for debugging
        response.headers.set('x-original-pathname', pathname);

        return response;
    }

    // Redirect if there is no locale
    const locale = getLocale(request);

    // e.g. incoming request is /products
    // The new URL is now /en/products
    return NextResponse.redirect(
        new URL(
            `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
            request.url,
        ),
    );
}

export const config = {
    // Matcher ignoring `/_next/`, `/api/`, and also allowing access to static files
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sounds/).*)'],
};
