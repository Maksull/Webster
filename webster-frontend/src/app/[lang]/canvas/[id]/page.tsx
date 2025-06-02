import { Metadata } from 'next';
import CanvasPageClient from './CanvasPageClient';

// Simple metadata that works without API calls
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Handle new canvas case
    if (id === 'new') {
        return {
            title: 'New Canvas - Drawing Editor',
            description:
                'Create a new digital canvas for drawing, sketching, and creative design.',
            openGraph: {
                title: 'New Canvas - Drawing Editor',
                description:
                    'Create a new digital canvas for drawing, sketching, and creative design.',
                type: 'website',
            },
        };
    }

    // Use generic metadata for existing canvases
    // The actual title will be updated client-side once the canvas loads
    return {
        title: 'Canvas - Drawing Editor',
        description:
            'Digital canvas for drawing, sketching, and creative design.',
        openGraph: {
            title: 'Canvas - Drawing Editor',
            description:
                'Digital canvas for drawing, sketching, and creative design.',
            type: 'website',
        },
    };
}

export default async function CanvasPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    return <CanvasPageClient id={resolvedParams.id} />;
}
