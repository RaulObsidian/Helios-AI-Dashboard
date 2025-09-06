// src/components/analysis/AIAnalysisPanel.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DrawingInstruction } from '../../types';

interface AIAnalysisPanelProps {
    onAnalysisResult: (result: { explanation: string; drawings: DrawingInstruction[] }) => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ onAnalysisResult }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [analysisText, setAnalysisText] = useState('');

    const handleExecuteCommand = async (command: string) => {
        setIsLoading(true);
        setAnalysisText(t('aiAnalysisPanel.loading'));
        try {
            const response = await fetch('http://localhost:3001/api/analysis/execute-command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command }),
            });
            if (!response.ok) throw new Error('Failed to execute command');
            const result = await response.json();
            
            setAnalysisText(result.explanation);
            onAnalysisResult(result);

        } catch (error) {
            console.error("Error executing analysis command:", error);
            setAnalysisText(t('aiAnalysisPanel.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-helios-gray p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-white mb-4">{t('aiAnalysisPanel.title')}</h3>
            <div className="space-y-2">
                <button 
                    onClick={() => handleExecuteCommand('find_support_resistance')}
                    disabled={isLoading}
                    className="btn btn-primary w-full disabled:opacity-50"
                >
                    {t('aiAnalysisPanel.buttons.supportResistance')}
                </button>
                {/* Aquí se añadirán más botones de análisis en el futuro */}
            </div>
            <div className="mt-4 p-2 bg-helios-dark rounded">
                <h4 className="font-bold text-helios-accent">{t('aiAnalysisPanel.explanationTitle')}</h4>
                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">
                    {analysisText || t('aiAnalysisPanel.welcome')}
                </p>
            </div>
        </div>
    );
};
