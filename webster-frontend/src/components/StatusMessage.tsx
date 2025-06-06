'use client';

import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';

type StatusMessageProps = {
    type: 'success' | 'error' | 'loading';
    message: string;
};

export function StatusMessage({ type, message }: StatusMessageProps) {
    if (!message && type !== 'loading') return null;

    let bgClass = '';
    let textClass = '';
    let borderClass = '';
    let Icon = AlertTriangle;

    switch (type) {
        case 'success':
            bgClass = 'bg-green-50 dark:bg-green-900/20';
            textClass = 'text-green-700 dark:text-green-200';
            borderClass = 'border-green-500';
            Icon = CheckCircle;
            break;
        case 'error':
            bgClass = 'bg-red-50 dark:bg-red-900/20';
            textClass = 'text-red-700 dark:text-red-200';
            borderClass = 'border-red-500';
            Icon = AlertTriangle;
            break;
        case 'loading':
            bgClass = 'bg-blue-50 dark:bg-blue-900/20';
            textClass = 'text-blue-700 dark:text-blue-200';
            borderClass = 'border-blue-500';
            Icon = Loader;
            break;
    }

    return (
        <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
            <div
                className={`${bgClass} border-l-4 ${borderClass} ${textClass} p-4 rounded-md animate-fadeIn flex items-start`}>
                <Icon
                    className={`h-5 w-5 mr-2 flex-shrink-0 mt-0.5 ${type === 'loading' ? 'animate-spin' : ''}`}
                />
                <span>{message}</span>
            </div>
        </div>
    );
}
