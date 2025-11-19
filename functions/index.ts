import { googleAI } from '@genkit-ai/googleai';
import { configure, defineFlow, generate } from '@genkit-ai/flow';
import { z } from 'zod';
import * as admin from 'firebase-admin';
import { bookAppointment, makeRestaurantReservation } from './tools';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Configure Genkit to use the Google AI plugin
configure({
    plugins: [googleAI()],
    logLevel: 'debug',
    enableTracing: true,
});

// A map of all available tools that the chat flow can use.
const allTools = { bookAppointment, makeRestaurantReservation };

// Simple keyword-based search function to find relevant knowledge
function findRelevantChunks(query: string, knowledgeBase: string[], limit = 3): string[] {
    if (!knowledgeBase || knowledgeBase.length === 0) return [];

    const queryWords = query.toLowerCase().split(/\s+/);
    const scores = knowledgeBase.map((chunk, index) => {
        const chunkWords = chunk.toLowerCase().split(/\s+/);
        const score = queryWords.reduce((acc, word) => {
            return acc + (chunkWords.includes(word) ? 1 : 0);
        }, 0);
        return { score, index };
    });

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, limit).filter(s => s.score > 0).map(s => knowledgeBase[s.index]);
}

// Define the main chat flow
export const chat = defineFlow(
    {
        name: 'chat',
        inputSchema: z.object({
            query: z.string(),
            agentId: z.string(), // Changed from businessProfile to agentId
            history: z.array(z.object({
                role: z.enum(['user', 'model']),
                content: z.string()
            })).optional()
        }),
        outputSchema: z.object({
            text: z.string(),
            toolRequest: z.any().optional(),
        }),
    },
    async ({ query, agentId, history = [] }) => {
        // 1. Fetch the agent from Firestore
        const agentDoc = await db.collection('agents').doc(agentId).get();
        if (!agentDoc.exists) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        const agent = agentDoc.data();
        if (!agent) throw new Error('Agent data is empty');

        // 2. Retrieve relevant context from the knowledge base
        const relevantChunks = findRelevantChunks(query, agent.knowledgeBase || []);

        // 3. Construct the augmented prompt
        let systemInstruction = agent.systemInstruction || 'You are a helpful assistant.';

        let augmentedPrompt = `QUESTION: ${query}`;

        if (relevantChunks.length > 0) {
            augmentedPrompt = `CONTEXT:\n${relevantChunks.join('\n\n---\n\n')}\n\n${augmentedPrompt}`;
        }

        // 4. Call the Gemini API
        // Note: For MVP we are simplifying tool usage. 
        // We can re-enable dynamic tools if we store tool config in the agent.
        // For now, let's assume all agents have access to all tools or no tools for simplicity, 
        // or we can just use text generation for the MVP as per the plan "Simple text KB".
        // Let's keep tools available but optional.

        const llmResponse = await generate({
            model: 'gemini-pro',
            prompt: augmentedPrompt,
            systemInstruction: systemInstruction,
            history: history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
            tools: [bookAppointment, makeRestaurantReservation], // keeping tools enabled
            config: {
                temperature: 0.3,
            }
        });

        return {
            text: llmResponse.text(),
        };
    }
);
