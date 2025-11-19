import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAgent } from '../services/agentService';
import { sendMessage } from '../services/chatService';
import { Agent, ChatMessage } from '../types';

export default function Playground() {
    const { agentId } = useParams();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (agentId) {
            loadAgent(agentId);
        }
    }, [agentId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadAgent = async (id: string) => {
        const data = await getAgent(id);
        setAgent(data);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !agentId) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await sendMessage(agentId, input, messages);
            const botMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Sorry, I encountered an error." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!agent) return <div>Loading Agent...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow-sm px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-gray-500 hover:text-gray-700">
                        &larr; Back
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900">Playground: {agent.name}</h1>
                </div>
                <div className="text-sm text-gray-500">
                    Testing Mode
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            <p>Start a conversation with {agent.name}.</p>
                            <p className="text-sm mt-2">Try asking about: {agent.knowledgeBase?.slice(0, 2).join(', ')}...</p>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-lg rounded-lg px-4 py-2 ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-900 shadow'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-500 rounded-lg px-4 py-2 shadow">
                                Typing...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="bg-white border-t p-4">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    );
}
