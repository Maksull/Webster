import { Metadata } from 'next';
import { Suspense } from 'react';
import ProfileSettings from './ProfileSettings';
import { StatusMessage } from '@/components';

export const metadata: Metadata = {
    title: 'Profile Settings',
    description: 'Update your profile information',
};

export default function ProfilePage() {
    return (
        <Suspense
            fallback={
                <StatusMessage
                    type="loading"
                    message="Loading profile settings..."
                />
            }>
            <ProfileSettings />
        </Suspense>
    );
}
