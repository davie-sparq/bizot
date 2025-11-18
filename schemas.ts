import { z } from 'zod';

// Schema for a single chat message
export const messageSchema = z.object({
  id: z.string(),
  text: z.string(),
  sender: z.enum(['user', 'bot']),
  feedback: z.enum(['good', 'bad']).nullish(),
  isFeedback: z.boolean().optional(),
});

// Schema for a learning suggestion
export const learningSuggestionSchema = z.object({
  id: z.string(),
  originalQuestion: z.string(),
  suggestedAnswer: z.string(),
  sourceUrl: z.string().optional(),
  status: z.enum(['pending', 'added']),
});

// Schema for a business service
export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  isSuggestion: z.boolean().optional(),
});

// Schema for a booking
export const bookingSchema = z.object({
  id: z.string(),
  serviceName: z.string(),
  details: z.record(z.any()),
  timestamp: z.string(),
});

// The master schema for the entire Business Profile
export const businessProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  businessType: z.string(),
  chatbotConfig: z.object({
    chatbotName: z.string(),
    systemInstruction: z.string(),
    goals: z.array(z.string()),
    availableTools: z.array(z.string()),
  }),
  knowledgeBase: z.array(z.string()),
  learningSuggestions: z.array(learningSuggestionSchema),
  chatHistory: z.array(z.array(messageSchema)),
  services: z.array(serviceSchema),
  bookings: z.array(bookingSchema),
});
