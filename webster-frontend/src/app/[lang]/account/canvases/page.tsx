import { Metadata } from 'next';
import { Suspense } from 'react';
import CanvasManager from './CanvasManager';
import { StatusMessage } from '@/components';

export const metadata: Metadata = {
    title: 'My Canvases',
    description: 'Manage and organize your canvases',
};

export default function CanvasesPage() {
    return (
        <Suspense
            fallback={
                <StatusMessage
                    type="loading"
                    message="Loading your canvases..."
                />
            }>
            <CanvasManager />
        </Suspense>
    );
}
