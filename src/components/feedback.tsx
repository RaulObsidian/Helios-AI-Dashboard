import React, { useState } from 'react';
import type { AppError } from '../types';
import { XCircleIcon } from './icons';

type Translator = (key: string) => string;

// --- Main Feedback Modal Component ---
export const FeedbackModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    t: Translator;
    errorLog: AppError[];
    onSubmit: () => void;
}> = ({ isOpen, onClose, t, errorLog, onSubmit }) => {
    const [activeTab, setActiveTab] = useState('errors');
    const [feedbackType, setFeedbackType] = useState('suggestion');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        onSubmit();
        setMessage('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000); // Reset after 3s
    };
    
    const TabButton = ({ id, label }: { id: string, label: string }) => (
         <button onClick={() => setActiveTab(id)} className={`flex-1 p-2 text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-helios-accent text-helios-accent' : 'border-transparent text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    const ErrorLogView = () => (
        <div className="overflow-y-auto h-96 pr-2">
            {errorLog.length > 0 ? (
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-helios-light-gray sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-2">{t('feedback.error_log.header.time')}</th>
                            <th scope="col" className="px-4 py-2">{t('feedback.error_log.header.severity')}</th>
                            <th scope="col" className="px-4 py-2">{t('feedback.error_log.header.message')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {errorLog.map(err => (
                            <tr key={err.id} className="border-b border-helios-light-gray hover:bg-helios-light-gray/50">
                                <td className="px-4 py-2 text-gray-400">{new Date(err.timestamp).toLocaleTimeString()}</td>
                                <td className={`px-4 py-2 font-semibold ${err.severity === 'Critical' ? 'text-helios-red' : 'text-yellow-400'}`}>{err.severity}</td>
                                <td className="px-4 py-2">{err.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>{t('feedback.error_log.no_errors')}</p>
                </div>
            )}
        </div>
    );
    
    const FeedbackFormView = () => (
        <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300">{t('feedback.form.type')}</label>
                 <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className="mt-1 block w-full bg-helios-light-gray border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-helios-accent focus:border-helios-accent">
                     <option value="suggestion">{t('feedback.form.type.suggestion')}</option>
                     <option value="bug">{t('feedback.form.type.bug')}</option>
                 </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300">{t('feedback.form.message')}</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    placeholder={t('feedback.form.placeholder')}
                    className="mt-1 block w-full bg-helios-light-gray border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-helios-accent focus:border-helios-accent"
                />
            </div>
            <div className="flex justify-end">
                <button type="submit" className="bg-helios-accent hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-500" disabled={!message.trim()}>
                    {t('feedback.form.button')}
                </button>
            </div>
             {submitted && <p className="text-sm text-helios-green text-center">{t('feedback.form.success')}</p>}
        </form>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`bg-helios-gray rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                 <header className="flex justify-between items-center p-4 border-b border-helios-light-gray flex-shrink-0">
                    <h2 className="text-2xl font-bold">{t('feedback.modal_title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <p className="text-gray-400 mb-4 text-sm">{t('feedback.intro')}</p>
                    <div className="flex border-b border-helios-light-gray mb-4">
                        <TabButton id="errors" label={t('feedback.tabs.errors')} />
                        <TabButton id="feedback" label={t('feedback.tabs.feedback')} />
                    </div>
                    {activeTab === 'errors' ? <ErrorLogView /> : <FeedbackFormView />}
                </main>
            </div>
        </div>
    );
};