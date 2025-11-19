"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const googleai_1 = require("@genkit-ai/googleai");
const flow_1 = require("@genkit-ai/flow");
const zod_1 = require("zod");
const admin = __importStar(require("firebase-admin"));
const tools_1 = require("./tools");
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Configure Genkit to use the Google AI plugin
(0, flow_1.configure)({
    plugins: [(0, googleai_1.googleAI)()],
    logLevel: 'debug',
    enableTracing: true,
});
// A map of all available tools that the chat flow can use.
const allTools = { bookAppointment: tools_1.bookAppointment, makeRestaurantReservation: tools_1.makeRestaurantReservation };
// Simple keyword-based search function to find relevant knowledge
function findRelevantChunks(query, knowledgeBase, limit = 3) {
    if (!knowledgeBase || knowledgeBase.length === 0)
        return [];
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
exports.chat = (0, flow_1.defineFlow)({
    name: 'chat',
    inputSchema: zod_1.z.object({
        query: zod_1.z.string(),
        agentId: zod_1.z.string(), // Changed from businessProfile to agentId
        history: zod_1.z.array(zod_1.z.object({
            role: zod_1.z.enum(['user', 'model']),
            content: zod_1.z.string()
        })).optional()
    }),
    outputSchema: zod_1.z.object({
        text: zod_1.z.string(),
        toolRequest: zod_1.z.any().optional(),
    }),
}, async ({ query, agentId, history = [] }) => {
    // 1. Fetch the agent from Firestore
    const agentDoc = await db.collection('agents').doc(agentId).get();
    if (!agentDoc.exists) {
        throw new Error(`Agent with ID ${agentId} not found`);
    }
    const agent = agentDoc.data();
    if (!agent)
        throw new Error('Agent data is empty');
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
    const llmResponse = await (0, flow_1.generate)({
        model: 'gemini-pro',
        prompt: augmentedPrompt,
        systemInstruction: systemInstruction,
        history: history.map(h => ({ role: h.role, content: [{ text: h.content }] })),
        tools: [tools_1.bookAppointment, tools_1.makeRestaurantReservation], // keeping tools enabled
        config: {
            temperature: 0.3,
        }
    });
    return {
        text: llmResponse.text(),
    };
});
