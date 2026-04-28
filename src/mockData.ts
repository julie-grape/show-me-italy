import type { GoldenRecord, Booking, Ticket, Transaction, RawData } from './types';

const customers = ['Marco Rossi', 'Giulia Bianchi', 'Luca Verdi', 'Elena Neri', 'Alessandro Gallo', 'Sofia Conti'];
const descriptions = ['TICKET FLIGHT ROM-MIL', 'TRAIN TICKET IT-772', 'BUS TRANSFER VCE', 'FERRY TICKET NAP-CAP'];

export const generateMockData = (): GoldenRecord[] => {
  const records: GoldenRecord[] = [];

  for (let i = 1; i <= 20; i++) {
    const bookingId = `BK-${2000 + i}`;
    const date = new Date(2024, 3, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    const baseAmount = parseFloat((Math.random() * 200 + 50).toFixed(2));
    
    const numTickets = Math.floor(Math.random() * 3) + 1; // 1 to 3 tickets per booking

    const booking: Booking = {
      id: bookingId,
      date,
      customer: customers[i % customers.length],
      amount: baseAmount * numTickets,
      currency: 'EUR',
      status: 'confirmed',
    };

    const transaction: Transaction = {
      id: `TX-${3000 + i}`,
      date,
      amount: booking.amount,
      currency: 'EUR',
      description: `Payment for ${bookingId} - ${booking.customer}`,
      source: 'Revolut',
      bookingId: bookingId,
    };

    for (let t = 1; t <= numTickets; t++) {
      const ticketId = `TK-${4000 + i}-${t}`;
      const status: GoldenRecord['overallStatus'] = Math.random() > 0.1 ? 'matched' : 'manual_review';
      
      const ticket: Ticket = {
        id: ticketId,
        bookingId: bookingId,
        receivedDate: date,
        pdfUrl: '#',
        status: status === 'matched' ? 'received' : 'missing',
        confidenceScore: status === 'matched' ? 98 : 45,
        passengerName: `${booking.customer} ${t > 1 ? `(Pax ${t})` : ''}`.trim(),
      };

      records.push({
        id: ticketId,
        booking,
        ticket,
        transaction,
        overallStatus: status,
        confidence: status === 'matched' ? 98 : 45,
      });
    }
  }

  return records;
};

export const generateRawData = (): RawData => {
  return {
    fareharbor: Array.from({ length: 10 }).map((_, i) => ({
      id: `FH-${5000 + i}`,
      booking_id: `BK-${2000 + i + 1}`,
      customer_name: customers[i % customers.length],
      total_paid: Math.random() * 500,
      status: 'completed',
      timestamp: new Date().toISOString(),
    })),
    revolut: Array.from({ length: 10 }).map((_, i) => ({
      id: `REV-${6000 + i}`,
      reference: `BK-${2000 + i + 1}`,
      amount: Math.random() * 500,
      currency: 'EUR',
      state: 'COMPLETED',
      created_at: new Date().toISOString(),
    })),
    gmail: Array.from({ length: 10 }).map((_, i) => ({
      id: `MSG-${7000 + i}`,
      subject: `Your Ticket for BK-${2000 + i + 1}`,
      from: 'bookings@fareharbor.com',
      date: new Date().toISOString(),
      snippet: 'Here is your confirmation for your upcoming trip to Rome...',
    })),
  };
};
