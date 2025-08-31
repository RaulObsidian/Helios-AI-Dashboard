import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { XCircleIcon } from './icons';

type Translator = (key: string) => string;

// --- Reusable Modal Wrapper ---
const ModalWrapper: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: string }> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-4xl' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className={`bg-helios-gray rounded-lg shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-helios-light-gray flex-shrink-0">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XCircleIcon className="w-8 h-8" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

// --- Manual Installation Modal ---
export const ManualInstallModal: React.FC<{ isOpen: boolean; onClose: () => void; t: Translator }> = ({ isOpen, onClose, t }) => {
    const Step: React.FC<{ number: number; title: string; children: ReactNode }> = ({ number, title, children }) => (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-helios-accent rounded-full flex items-center justify-center text-white font-bold text-lg">{number}</div>
            <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <div className="text-gray-300 mt-1">{children}</div>
            </div>
        </div>
    );
    const CodeBlock: React.FC<{ children: string }> = ({ children }) => <code className="bg-black/50 text-green-400 p-2 rounded-md block font-mono text-sm">{children}</code>;

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={t('manual_install.title')} maxWidth="max-w-2xl">
            <div className="space-y-8">
                <Step number={1} title={t('manual_install.step1.title')}>
                    <p>{t('manual_install.step1.body')}</p>
                </Step>
                <Step number={2} title={t('manual_install.step2.title')}>
                    <p>{t('manual_install.step2.body')}</p>
                </Step>
                <Step number={3} title={t('manual_install.step3.title')}>
                    <p>{t('manual_install.step3.body')}</p>
                    <CodeBlock>npm install -g serve</CodeBlock>
                </Step>
                <Step number={4} title={t('manual_install.step4.title')}>
                    <p>{t('manual_install.step4.body')}</p>
                    <CodeBlock>serve -s .</CodeBlock>
                </Step>
                <Step number={5} title={t('manual_install.step5.title')}>
                    <p>{t('manual_install.step5.body')}</p>
                </Step>
            </div>
        </ModalWrapper>
    );
};

// --- User Guide Modal ---
export const UserGuideModal: React.FC<{ isOpen: boolean; onClose: () => void; t: Translator }> = ({ isOpen, onClose, t }) => {
    const [activeSection, setActiveSection] = useState('welcome');

    const navItems = [
        { id: 'welcome', label: t('user_guide.nav.welcome') },
        { id: 'connection', label: t('user_guide.nav.connection') },
        { id: 'agent_config', label: t('user_guide.nav.agent_config') },
        { id: 'trading_sandbox', label: t('user_guide.nav.trading_sandbox') },
        { id: 'helios_vs_supervisor', label: t('user_guide.nav.helios_vs_supervisor') },
        { id: 'chart_analysis', label: t('user_guide.nav.chart_analysis') },
        { id: 'logs', label: t('user_guide.nav.logs') },
    ];

    const SectionContent: React.FC<{ sectionId: string }> = ({ sectionId }) => {
        const content: Record<string, { title: string; body: ReactNode }> = {
            welcome: {
                title: t('user_guide.welcome.title'),
                body: <p>{t('user_guide.welcome.body')}</p>,
            },
            connection: {
                title: t('user_guide.connection.title'),
                body: <p>{t('user_guide.connection.body')}</p>,
            },
            agent_config: {
                title: t('user_guide.agent_config.title'),
                body: <p>{t('user_guide.agent_config.body')}</p>,
            },
            trading_sandbox: {
                title: t('user_guide.trading_sandbox.title'),
                body: (
                    <div className="space-y-2">
                        <p>{t('user_guide.trading_sandbox.body1')}</p>
                        <p className="p-3 bg-red-900/50 border-l-4 border-helios-red rounded-r-md">{t('user_guide.trading_sandbox.body2')}</p>
                    </div>
                ),
            },
            helios_vs_supervisor: {
                title: t('user_guide.helios_vs_supervisor.title'),
                body: <p>{t('user_guide.helios_vs_supervisor.body')}</p>,
            },
            chart_analysis: {
                title: t('user_guide.chart_analysis.title'),
                body: <p>{t('user_guide.chart_analysis.body')}</p>,
            },
            logs: {
                title: t('user_guide.logs.title'),
                body: <p>{t('user_guide.logs.body')}</p>,
            },
        };

        const current = content[sectionId];
        return (
            <div>
                <h3 className="text-3xl font-bold mb-4 text-helios-accent">{current.title}</h3>
                <div className="prose prose-invert max-w-none text-gray-300">{current.body}</div>
            </div>
        );
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={t('user_guide.title')}>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                <nav className="flex-shrink-0 md:w-1/4">
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full text-left p-2 rounded-md transition-colors ${activeSection === item.id ? 'bg-helios-accent text-white font-bold' : 'hover:bg-helios-light-gray'}`}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex-grow border-t md:border-t-0 md:border-l border-helios-light-gray pt-4 md:pt-0 md:pl-6">
                    <SectionContent sectionId={activeSection} />
                </div>
            </div>
        </ModalWrapper>
    );
};

// --- Disclaimer Modal ---
export const DisclaimerModal: React.FC<{ isOpen: boolean; onClose: () => void; t: Translator }> = ({ isOpen, onClose, t }) => {
    const Section: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
        <div>
            <h3 className="text-xl font-bold text-helios-accent mb-2">{title}</h3>
            <p className="text-gray-300">{children}</p>
        </div>
    );

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title={t('disclaimer.title')} maxWidth="max-w-3xl">
            <div className="space-y-6">
                <Section title={t('disclaimer.section1.title')}>{t('disclaimer.section1.body')}</Section>
                <Section title={t('disclaimer.section2.title')}>{t('disclaimer.section2.body')}</Section>
                <Section title={t('disclaimer.section3.title')}>{t('disclaimer.section3.body')}</Section>
                <Section title={t('disclaimer.section4.title')}>{t('disclaimer.section4.body')}</Section>
                <Section title={t('disclaimer.section5.title')}>{t('disclaimer.section5.body')}</Section>
                <Section title={t('disclaimer.section6.title')}>{t('disclaimer.section6.body')}</Section>
                 <div className="p-4 bg-helios-dark rounded-md mt-4">
                    <h4 className="font-bold text-lg text-yellow-400">{t('disclaimer.section7.title')}</h4>
                    <p className="text-gray-400 mt-1">{t('disclaimer.section7.body')}</p>
                </div>
            </div>
        </ModalWrapper>
    );
};