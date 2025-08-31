import React, { useState, useEffect } from 'react';
import type { ToastNotification } from '../types';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon } from './icons';

const ICONS: { [key in ToastNotification['type']]: React.ReactNode } = {
    success: <CheckCircleIcon className="w-6 h-6 text-helios-green" />,
    error: <XCircleIcon className="w-6 h-6 text-helios-red" />,
    warning: <ExclamationCircleIcon className="w-6 h-6 text-yellow-400" />,
    info: <InformationCircleIcon className="w-6 h-6 text-helios-accent" />,
};

const BG_COLORS: { [key in ToastNotification['type']]: string } = {
    success: 'bg-green-800/80 border-helios-green',
    error: 'bg-red-800/80 border-helios-red',
    warning: 'bg-yellow-800/80 border-yellow-400',
    info: 'bg-blue-800/80 border-helios-accent',
};

const Toast: React.FC<{ notification: ToastNotification }> = ({ notification }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Animate in
        const timerIn = setTimeout(() => setShow(true), 10);
        // Animate out before removal (which is handled by parent)
        const timerOut = setTimeout(() => setShow(false), 4500);

        return () => {
            clearTimeout(timerIn);
            clearTimeout(timerOut);
        };
    }, []);

    return (
        <div
            role="alert"
            className={`
                w-full max-w-sm sm:max-w-xs
                flex items-start p-4 rounded-lg shadow-lg
                backdrop-blur-md border 
                transition-all duration-300 ease-in-out
                ${BG_COLORS[notification.type]}
                ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
        >
            <div className="flex-shrink-0">{ICONS[notification.type]}</div>
            <div className="ml-3">
                <p className="text-sm font-medium text-white">{notification.message}</p>
            </div>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastNotification[] }> = ({ toasts }) => {
    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end sm:items-start justify-center sm:justify-end p-4 space-y-3 flex-col z-50 pointer-events-none"
        >
            {toasts.map(toast => (
                <Toast key={toast.id} notification={toast} />
            ))}
        </div>
    );
};