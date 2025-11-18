import { FunctionDeclaration, Type } from '@google/genai';

export const bookAppointment: FunctionDeclaration = {
  name: 'bookAppointment',
  description: 'Books a generic appointment for a client or guest. Use this for scheduling services like consultations, spa treatments, classes, or check-ups.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      serviceName: {
        type: Type.STRING,
        description: 'The specific name of the service, class, or type of appointment to book, e.g., "Haircut & Style", "Initial Consultation", "60-minute Massage".',
      },
      date: {
        type: Type.STRING,
        description: 'The desired date for the appointment, e.g., "2024-08-15".',
      },
      time: {
        type: Type.STRING,
        description: 'The desired time for the appointment, e.g., "14:30".',
      },
      guestName: {
        type: Type.STRING,
        description: "The name of the guest or client for whom the appointment is being booked.",
      },
    },
    required: ['serviceName', 'date', 'time', 'guestName'],
  },
};

export const makeRestaurantReservation: FunctionDeclaration = {
  name: 'makeRestaurantReservation',
  description: 'Makes a reservation at a hotel restaurant. Use this when a user explicitly asks to book a table.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      numberOfPeople: {
        type: Type.NUMBER,
        description: 'The number of people in the party for the reservation.',
      },
      date: {
        type: Type.STRING,
        description: 'The desired date for the reservation, e.g., "2024-08-15".',
      },
      time: {
        type: Type.STRING,
        description: 'The desired time for the reservation, e.g., "19:00".',
      },
      guestName: {
        type: Type.STRING,
        description: "The name under which to make the reservation.",
      },
    },
    required: ['numberOfPeople', 'date', 'time', 'guestName'],
  },
};

/**
 * A centralized lookup object for all available function declarations.
 * This allows dynamic selection of tools based on the business profile configuration.
 */
export const AVAILABLE_TOOLS: { [key: string]: FunctionDeclaration } = {
  bookAppointment,
  makeRestaurantReservation,
};
