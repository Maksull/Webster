import { Metadata } from 'next';
import { Suspense } from 'react';
import SecuritySettings from './SecuritySettings';
import { StatusMessage } from '@/components';

export const metadata: Metadata = {
    title: 'Security Settings',
    description: 'Manage your account security and privacy settings',
};

export default function SecurityPage() {
    return (
        <Suspense
            fallback={
                <StatusMessage
                    type="loading"
                    message="Loading security settings..."
                />
            }>
            <SecuritySettings />
        </Suspense>
    );
}
