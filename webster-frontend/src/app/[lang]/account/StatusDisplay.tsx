'use client';

import { StatusMessage } from '@/components';
import { useStatus } from '@/contexts/StatusContext';

export default function StatusDisplayClient() {
    const { status } = useStatus();

    if (!status) return null;

    return (
        <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
            <StatusMessage type={status.type} message={status.message} />
        </div>
    );
}
