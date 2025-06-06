import type { Metadata } from 'next';
import './globals.css';
import { i18n } from '@/i18n-config';

export const metadata: Metadata = {
    title: 'Webster',
    description: 'Webster helps you design images quickly and easily.',
};

export async function generateStaticParams() {
    return i18n.locales.map(locale => ({ lang: locale }));
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
