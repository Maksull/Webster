'use client';

import React, { createContext, useContext, useState } from 'react';

type StatusType = 'success' | 'error' | 'loading';

interface StatusContextType {
    showStatus: (type: StatusType, message: string, duration?: number) => void;
    clearStatus: () => void;
    status: { type: StatusType; message: string } | null;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export function StatusProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<{
        type: StatusType;
        message: string;
    } | null>(null);

    const showStatus = (type: StatusType, message: string, duration = 3000) => {
        setStatus({ type, message });

        if (duration > 0) {
            setTimeout(() => {
                setStatus(null);
            }, duration);
        }
    };

    const clearStatus = () => setStatus(null);

    return (
        <StatusContext.Provider value={{ showStatus, clearStatus, status }}>
            {children}
        </StatusContext.Provider>
    );
}

export function useStatus() {
    const context = useContext(StatusContext);
    if (context === undefined) {
        throw new Error('useStatus must be used within a StatusProvider');
    }
    return context;
}
