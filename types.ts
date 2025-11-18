export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  feedback?: 'good' | 'bad' | null;
  isFeedback?: boolean; // To flag if a "Suggest Improvement" has been submitted for this message
}

export interface LearningSuggestion {
  id:string;
  originalQuestion: string;
  suggestedAnswer: string;
  sourceUrl?: string;
  status: 'pending' | 'added';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  isSuggestion?: boolean; // To differentiate AI suggestions from confirmed services
}

export interface Booking {
  id: string;
  serviceName: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  industry: string;
  businessType: string;
  chatbotConfig: {
    chatbotName: string;
    systemInstruction: string;
    goals: string[];
    availableTools: string[];
  };
  knowledgeBase: string[];
  learningSuggestions: LearningSuggestion[];
  chatHistory: Message[][]; // An array of conversations, where each conversation is an array of messages
  services: Service[];
  bookings: Booking[];
}