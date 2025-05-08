import { i18n, Locale } from '@/i18n-config';
import type { Metadata } from 'next';
import '../globals.css';
import { ThemeProvider, DictionaryProvider, AuthProvider } from '@/contexts';
import { getDictionary } from '@/get-dictionary';
import { Footer } from './Footer';
import { Header } from './Header';

export const metadata: Metadata = {
    title: {
        default: 'Uevent',
        template: '%s - Uevent',
    },
    description:
        'Find and attend events to expand your network and grow professionally',
};

export async function generateStaticParams() {
    return i18n.locales.map(locale => ({ lang: locale }));
}

export default async function LangLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: Locale }>;
}) {
    const resolvedParams = await params;
    const dict = await getDictionary(resolvedParams.lang);

    return (
        <ThemeProvider>
            <DictionaryProvider dict={dict} lang={resolvedParams.lang}>
                <AuthProvider>
                    <div className="flex flex-col min-h-screen bg-white dark:bg-dark-bg transition-colors duration-300">
                        <Header />
                        <main className="flex-grow">{children}</main>
                        <Footer />
                    </div>
                </AuthProvider>
            </DictionaryProvider>
        </ThemeProvider>
    );
}
