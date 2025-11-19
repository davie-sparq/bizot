import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createAgent, getAgent, updateAgent } from '../services/agentService';
import { Agent } from '../types';

export default function AgentEditor() {
    const { agentId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(agentId ? true : false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [systemInstruction, setSystemInstruction] = useState('');
    const [knowledgeBase, setKnowledgeBase] = useState<string[]>([]);
    const [newKnowledge, setNewKnowledge] = useState('');

    useEffect(() => {
        if (agentId) {
            loadAgent(agentId);
        }
    }, [agentId]);

    const loadAgent = async (id: string) => {
        try {
            const agent = await getAgent(id);
            if (agent) {
                setName(agent.name);
                setSystemInstruction(agent.systemInstruction);
                setKnowledgeBase(agent.knowledgeBase || []);
            }
        } catch (error) {
            console.error("Error loading agent:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setSaving(true);
        try {
            const agentData = {
                name,
                systemInstruction,
                knowledgeBase,
            };

            if (agentId) {
                await updateAgent(agentId, agentData);
            } else {
                await createAgent(currentUser.uid, agentData);
            }
            navigate('/');
        } catch (error) {
            console.error("Error saving agent:", error);
            alert("Failed to save agent");
        } finally {
            setSaving(false);
        }
    };

    const addKnowledge = () => {
        if (newKnowledge.trim()) {
            setKnowledgeBase([...knowledgeBase, newKnowledge.trim()]);
            setNewKnowledge('');
        }
    };

    const removeKnowledge = (index: number) => {
        setKnowledgeBase(knowledgeBase.filter((_, i) => i !== index));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10">
            <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">{agentId ? 'Edit Agent' : 'Create New Agent'}</h1>
                <button
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    Cancel
                </button>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <form onSubmit={handleSave} className="space-y-8 divide-y divide-gray-200 bg-white p-8 shadow rounded-lg">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Agent Name
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Pizza Shop Assistant"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="instruction" className="block text-sm font-medium text-gray-700">
                                System Instructions
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="instruction"
                                    name="instruction"
                                    rows={4}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={systemInstruction}
                                    onChange={(e) => setSystemInstruction(e.target.value)}
                                    placeholder="Describe how the agent should behave..."
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Define the personality and core rules for your agent.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Knowledge Base</label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="text"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={newKnowledge}
                                    onChange={(e) => setNewKnowledge(e.target.value)}
                                    placeholder="Add a fact (e.g., 'We are open 9am-5pm')"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKnowledge())}
                                />
                                <button
                                    type="button"
                                    onClick={addKnowledge}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                >
                                    Add
                                </button>
                            </div>
                            <ul className="mt-4 space-y-2">
                                {knowledgeBase.map((kb, index) => (
                                    <li key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <span className="text-sm text-gray-700">{kb}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeKnowledge(index)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Agent'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
