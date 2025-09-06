// src/components/analysis/ExplainerLog.tsx
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
// import { webSocketService } from '../../services/WebSocketService';

const ExplainerLog: React.FC = () => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const term = useRef<Terminal | null>(null);
    const fitAddon = useRef(new FitAddon());

    useEffect(() => {
        if (terminalRef.current && !term.current) {
            term.current = new Terminal({
                fontSize: 13,
                fontFamily: '"Fira Code", monospace',
                                theme: {
                    background: '#161b22',
                    foreground: '#c9d1d9',
                    cursor: '#c9d1d9',
                    black: '#21262d',
                    red: '#ff7b72',
                    green: '#56d364',
                    yellow: '#e3b341',
                    blue: '#58a6ff',
                    magenta: '#bc8cff',
                    cyan: '#79c0ff',
                    white: '#c9d1d9',
                },
                convertEol: true,
                disableStdin: true,
            });
            
            const currentTerm = term.current;
            currentTerm.loadAddon(fitAddon.current);
            currentTerm.open(terminalRef.current);
            fitAddon.current.fit();

            currentTerm.writeln('[\x1b[34mHelios AI Quant Engine\x1b[0m] Rationale Log Initialized.');
            currentTerm.writeln('Awaiting analysis commands...');
        }

        // const handleAIRationale = (logData: { text: string }) => {
        //     if (!term.current) return;
        //     const timestamp = new Date().toLocaleTimeString();
        //     term.current.writeln(`[${timestamp}] ${logData.text}`);
        // };
        // webSocketService.subscribe('AI_RATIONALE', handleAIRationale);

        const observer = new ResizeObserver(() => {
            fitAddon.current.fit();
        });
        if (terminalRef.current) {
            observer.observe(terminalRef.current);
        }

        return () => {
            // webSocketService.unsubscribe('AI_RATIONALE', handleAIRationale);
            observer.disconnect();
        };
    }, []);

    return <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />;
};

export default ExplainerLog;
