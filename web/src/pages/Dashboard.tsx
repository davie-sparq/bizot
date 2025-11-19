import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { getUserAgents } from '../services/agentService';
import { Agent } from '../types';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            loadAgents();
        }
    }, [currentUser]);

    const loadAgents = async () => {
        if (!currentUser) return;
        try {
            const userAgents = await getUserAgents(currentUser.uid);
            setAgents(userAgents);
        } catch (error) {
            console.error("Error loading agents:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-600">Bizot Platform</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">{currentUser?.email}</span>
                            <button
                                onClick={() => auth.signOut()}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Your Agents</h2>
                        <Link
                            to="/agent/new"
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Create New Agent
                        </Link>
                    </div>

                    {loading ? (
                        <div>Loading...</div>
                    ) : agents.length === 0 ? (
                        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                            <div className="text-center">
                                <p className="mt-2 text-gray-500">You haven't created any agents yet.</p>
                                <Link to="/agent/new" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                                    Create Your First Agent
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {agents.map((agent) => (
                                <div key={agent.id} className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h3 className="text-lg font-medium text-gray-900 truncate">{agent.name}</h3>
                                        <p className="mt-1 text-sm text-gray-500 truncate">{agent.systemInstruction}</p>
                                        <div className="mt-4 flex space-x-3">
                                            <Link
                                                to={`/agent/${agent.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                to={`/playground/${agent.id}`}
                                                className="text-green-600 hover:text-green-900 text-sm font-medium"
                                            >
                                                Test in Playground
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
