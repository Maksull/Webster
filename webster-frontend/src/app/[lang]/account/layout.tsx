import { Metadata } from 'next';
import { Suspense } from 'react';
import AccountHeader from './AccountHeader';
import { StatusProvider } from '@/contexts/StatusContext';
import StatusDisplayClient from './StatusDisplay';
import AccountNavigation from './AccountNavigation';
import { LoadingSpinner, StatusMessage } from '@/components';

export const metadata: Metadata = {
    title: 'Account',
    description: 'Manage your account settings and canvases',
};

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StatusProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Suspense fallback={<LoadingSpinner />}>
                    <AccountHeader />
                </Suspense>

                <StatusDisplayClient />

                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-64 flex-shrink-0">
                            <AccountNavigation />
                        </div>
                        <div className="flex-1">
                            <Suspense
                                fallback={
                                    <StatusMessage
                                        type="loading"
                                        message="Loading..."
                                    />
                                }>
                                {children}
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </StatusProvider>
    );
}
