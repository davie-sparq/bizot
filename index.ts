
import { googleAI } from '@genkit-ai/googleai';
import { configure, defineFlow, generate, run } from '@genkit-ai/flow';
import { z } from 'zod';
import { businessProfileSchema } from './schemas';
import { bookAppointment, makeRestaurantReservation } from './tools';

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
      businessProfile: businessProfileSchema, // Use the strong schema
    }),
    // Output will be a structured object
    outputSchema: z.object({
        type: z.enum(['text', 'tool_confirmation']),
        text: z.string(),
        toolRequest: z.any().optional(),
        toolResult: z.any().optional(),
    }),
  },
  async ({ query, businessProfile }) => {
    
    // 1. Dynamically select the tools available for this business profile
    const availableTools = businessProfile.chatbotConfig.availableTools
        .map(toolName => allTools[toolName as keyof typeof allTools])
        .filter(tool => !!tool);

    // 2. Retrieve relevant context from the knowledge base
    const relevantChunks = findRelevantChunks(query, businessProfile.knowledgeBase);

    // 3. Format the available services for the prompt
    const servicesText = businessProfile.services
      .filter(s => !s.isSuggestion)
      .map(s => `- ${s.name} (${s.category}): ${s.description}`)
      .join('\n');

    // 4. Construct the augmented prompt
    const systemInstruction = businessProfile.chatbotConfig.systemInstruction
        .replace('{{chatbotName}}', businessProfile.chatbotConfig.chatbotName)
        .replace('{{businessName}}', businessProfile.name);

    let augmentedPrompt = `QUESTION: ${query}`;
      
    if (relevantChunks.length > 0) {
      augmentedPrompt = `CONTEXT:\n${relevantChunks.join('\n\n---\n\n')}\n\n${augmentedPrompt}`;
    }

    if (servicesText) {
      augmentedPrompt = `AVAILABLE SERVICES:\n${servicesText}\n\n${augmentedPrompt}`;
    }

    // 5. Call the Gemini API with tools
    const llmResponse = await generate({
      model: 'gemini-pro',
      prompt: augmentedPrompt,
      systemInstruction: systemInstruction,
      tools: availableTools,
      config: {
        temperature: 0.1, // Lower temperature for more predictable, grounded responses
      }
    });

    // 6. Check if the AI wants to call a tool
    const toolRequest = llmResponse.toolRequest();
    if (toolRequest) {
      console.log('Tool call requested:', toolRequest);

      // Special handling for booking tools to create a confirmation
      const toolName = toolRequest.name;
      const args = toolRequest.input;

      let confirmationText = '';

      if (toolName === 'bookAppointment') {
        confirmationText = `Your appointment for a ${args.serviceName} for ${args.guestName} on ${args.date} at ${args.time} has been confirmed.`;
      } else if (toolName === 'makeRestaurantReservation') {
        confirmationText = `Your restaurant reservation for ${args.numberOfPeople} people under the name ${args.guestName} on ${args.date} at ${args.time} has been confirmed.`;
      }
      
      // In a real application, you would run the tool and get the result:
      // const toolResult = await runTool(toolRequest);
      // For now, we simulate the tool execution and return the confirmation.

      return {
        type: 'tool_confirmation',
        text: confirmationText,
        toolRequest: toolRequest,
        toolResult: { success: true }, // Simulated result
      };
    }

    // 7. If no tool is called, return the text response
    return {
        type: 'text',
        text: llmResponse.text(),
    };
  }
);
