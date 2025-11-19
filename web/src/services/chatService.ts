import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

interface ChatResponse {
    text: string;
    toolRequest?: any;
    toolResult?: any;
}

export const sendMessage = async (agentId: string, query: string, history: any[] = []) => {
    const chatFunction = httpsCallable(functions, 'chat');

    try {
        const result = await chatFunction({
            query,
            agentId,
            history
        });

        return result.data as ChatResponse;
    } catch (error) {
        console.error("Error calling chat function:", error);
        throw error;
    }
};
