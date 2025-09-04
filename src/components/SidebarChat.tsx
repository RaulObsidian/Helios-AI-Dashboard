// src/components/SidebarChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperAirplaneIcon } from './icons'; // Necesitaremos este icono

interface Message {
    text: string;
    sender: 'user' | 'assistant' | 'error';
}

export const SidebarChat: React.FC = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/assistant/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: input }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const assistantMessage: Message = { text: data.response, sender: 'assistant' };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            const errorMessage: Message = { text: 'Error connecting to the AI engine.', sender: 'error' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-helios-dark text-gray-300 text-sm absolute bottom-0 left-0 w-full border-t border-gray-700 pt-4">
            <h3 className="font-bold text-center text-helios-accent px-2">{t('chat.title')}</h3>
            <div className="flex-grow overflow-y-auto p-2 space-y-3 my-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`w-full flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs rounded-lg px-3 py-2 ${
                            msg.sender === 'user' ? 'bg-helios-accent text-white' : 
                            msg.sender === 'assistant' ? 'bg-gray-700 text-gray-200' : 'bg-red-800 text-white'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-2 flex items-center border-t border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder={t('chat.placeholder')}
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-3 py-1 text-sm focus:ring-helios-accent focus:border-helios-accent"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading} className="ml-2 p-2 rounded-md bg-helios-accent text-white disabled:opacity-50">
                    <PaperAirplaneIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
