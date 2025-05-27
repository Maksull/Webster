import { Metadata } from 'next';
import { Suspense } from 'react';
import TemplateManager from './TemplateManager';
import { StatusMessage } from '@/components';

export const metadata: Metadata = {
    title: 'My Templates',
    description: 'Manage and organize your templates'
};

export default function TemplatesPage() {
    return (
        <Suspense
            fallback={
                <StatusMessage
                    type="loading"
                    message="Loading your templates..."
                />
            }>
            <TemplateManager />
        </Suspense>
    );
}