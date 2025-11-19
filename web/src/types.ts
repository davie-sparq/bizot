export interface Agent {
    id: string;
    ownerId: string;
    name: string;
    systemInstruction: string;
    knowledgeBase: string[]; // Array of text chunks for MVP
    status: 'draft' | 'active';
    createdAt: number;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface ChatSession {
    id: string;
    agentId: string;
    userId: string; // The business owner testing it
    messages: ChatMessage[];
    createdAt: number;
}
