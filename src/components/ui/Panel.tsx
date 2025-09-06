// src/components/ui/Panel.tsx
import React from 'react';

interface PanelProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Panel: React.FC<PanelProps> = ({ children, className = '', title }) => {
    return (
        <div
            className={`
                bg-background-panel 
                rounded-xl 
                border border-border-color
                shadow-neo
                p-6
                transition-all duration-300
                ${className}
            `}
        >
            {title && (
                <h3 className="text-xl font-bold text-text-primary mb-4 border-b border-border-color pb-2">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};