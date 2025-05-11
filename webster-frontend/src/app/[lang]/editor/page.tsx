'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import with no SSR
const DrawingEditor = dynamic(() => import('./DrawingEditor'), { ssr: false });

export default function EditorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen text-red-600 flex items-center justify-center">
                    Loading editor...
                </div>
            }>
            <DrawingEditor />
        </Suspense>
    );
}
