"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessProfileSchema = exports.bookingSchema = exports.serviceSchema = exports.learningSuggestionSchema = exports.messageSchema = void 0;
const zod_1 = require("zod");
// Schema for a single chat message
exports.messageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string(),
    sender: zod_1.z.enum(['user', 'bot']),
    feedback: zod_1.z.enum(['good', 'bad']).nullish(),
    isFeedback: zod_1.z.boolean().optional(),
});
// Schema for a learning suggestion
exports.learningSuggestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    originalQuestion: zod_1.z.string(),
    suggestedAnswer: zod_1.z.string(),
    sourceUrl: zod_1.z.string().optional(),
    status: zod_1.z.enum(['pending', 'added']),
});
// Schema for a business service
exports.serviceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    isSuggestion: zod_1.z.boolean().optional(),
});
// Schema for a booking
exports.bookingSchema = zod_1.z.object({
    id: zod_1.z.string(),
    serviceName: zod_1.z.string(),
    details: zod_1.z.record(zod_1.z.any()),
    timestamp: zod_1.z.string(),
});
// The master schema for the entire Business Profile
exports.businessProfileSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    industry: zod_1.z.string(),
    businessType: zod_1.z.string(),
    chatbotConfig: zod_1.z.object({
        chatbotName: zod_1.z.string(),
        systemInstruction: zod_1.z.string(),
        goals: zod_1.z.array(zod_1.z.string()),
        availableTools: zod_1.z.array(zod_1.z.string()),
    }),
    knowledgeBase: zod_1.z.array(zod_1.z.string()),
    learningSuggestions: zod_1.z.array(exports.learningSuggestionSchema),
    chatHistory: zod_1.z.array(zod_1.z.array(exports.messageSchema)),
    services: zod_1.z.array(exports.serviceSchema),
    bookings: zod_1.z.array(exports.bookingSchema),
});
