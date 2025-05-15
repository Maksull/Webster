import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Account',
    description: 'Manage your account settings and canvases',
};

export default async function AccountPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    redirect(`/${lang}/account/profile`);
}
