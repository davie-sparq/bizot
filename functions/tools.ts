import { defineTool } from './src/genkit-adapter';
import { z } from 'zod';

// Define the tool for booking a generic appointment
export const bookAppointment = defineTool(
    {
        name: 'bookAppointment',
        description: 'Books a generic appointment for a client or guest. Use this for scheduling services like consultations, spa treatments, classes, or check-ups.',
        inputSchema: z.object({
            serviceName: z.string().describe('The specific name of the service, class, or type of appointment to book, e.g., "Haircut & Style", "Initial Consultation", "60-minute Massage".'),
            date: z.string().describe('The desired date for the appointment, e.g., "2024-08-15".'),
            time: z.string().describe('The desired time for the appointment, e.g., "14:30".'),
            guestName: z.string().describe("The name of the guest or client for whom the appointment is being booked."),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            bookingId: z.string().optional(),
            message: z.string(),
        }),
    },
    async (input: any) => {
        console.log('TOOL: Running bookAppointment with input:', input);

        // In a real application, you would save this to a database.
        const bookingId = `BK-APT-${Date.now()}`;

        return {
            success: true,
            bookingId: bookingId,
            message: `Appointment confirmed for ${input.guestName} for the service '${input.serviceName}' on ${input.date} at ${input.time}. The booking ID is ${bookingId}.`,
        };
    }
);

// Define the tool for making a restaurant reservation
export const makeRestaurantReservation = defineTool(
    {
        name: 'makeRestaurantReservation',
        description: 'Makes a reservation at a hotel restaurant. Use this when a user explicitly asks to book a table.',
        inputSchema: z.object({
            numberOfPeople: z.number().describe('The number of people in the party for the reservation.'),
            date: z.string().describe('The desired date for the reservation, e.g., "2024-08-15".'),
            time: z.string().describe('The desired time for the reservation, e.g., "19:00".'),
            guestName: z.string().describe("The name under which to make the reservation."),
        }),
        outputSchema: z.object({
            success: z.boolean(),
            bookingId: z.string().optional(),
            message: z.string(),
        }),
    },
    async (input: any) => {
        console.log('TOOL: Running makeRestaurantReservation with input:', input);

        // In a real application, you would save this to a database.
        const bookingId = `BK-RES-${Date.now()}`;

        return {
            success: true,
            bookingId: bookingId,
            message: `Reservation confirmed for ${input.guestName} for a party of ${input.numberOfPeople} on ${input.date} at ${input.time}. The booking ID is ${bookingId}.`
        };
    }
);
