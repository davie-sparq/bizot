import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AgentEditor from './pages/AgentEditor'; // Assuming this is needed for /agent routes
import Playground from './pages/Playground';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        // Optionally render a loading spinner or placeholder
        return <div>Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agent/new"
                        element={
                            <PrivateRoute>
                                <AgentEditor />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agent/:agentId"
                        element={
                            <PrivateRoute>
                                <AgentEditor />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/playground/:agentId"
                        element={
                            <PrivateRoute>
                                <Playground />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
