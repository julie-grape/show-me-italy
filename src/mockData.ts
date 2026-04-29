import type { GoldenRecord, Booking, Transaction, RawData } from './types';

const customers = ['Marco Rossi', 'Giulia Bianchi', 'Luca Verdi', 'Elena Neri', 'Alessandro Gallo', 'Sofia Conti'];

export const generateMockData = (): GoldenRecord[] => {
  const records: GoldenRecord[] = [];

  // Generate some matched records
  for (let i = 1; i <= 12; i++) {
    const bookingId = `BK-${2000 + i}`;
    const date = new Date(2024, 3, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    const baseAmount = parseFloat((Math.random() * 200 + 50).toFixed(2));
    const numTickets = Math.floor(Math.random() * 2) + 1;

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
      records.push({
        id: ticketId,
        booking,
        ticket: {
          id: ticketId,
          bookingId,
          receivedDate: date,
          pdfUrl: '#',
          status: 'received',
          confidenceScore: 98 + Math.random(),
          passengerName: `${booking.customer} ${t > 1 ? `(Pax ${t})` : ''}`.trim(),
        },
        transaction,
        overallStatus: 'matched',
        confidence: 98 + Math.random(),
      });
    }
  }

  // Add "PDF Ticket Missing" (2 items)
  for (let i = 1; i <= 2; i++) {
    const bookingId = `BK-300${i}`;
    const date = '2024-04-10';
    const booking: Booking = {
      id: bookingId,
      date,
      customer: customers[i % customers.length],
      amount: 150.00,
      currency: 'EUR',
      status: 'confirmed',
    };
    const ticketId = `TK-500${i}`;
    records.push({
      id: ticketId,
      booking,
      ticket: {
        id: ticketId,
        bookingId,
        receivedDate: date,
        pdfUrl: '#',
        status: 'missing',
        confidenceScore: 0,
        passengerName: `${booking.customer}`,
      },
      overallStatus: 'manual_review',
      issueType: 'pdf_missing',
      confidence: 45,
    });
  }

  // Add "Unmatched Purchase" (2 items)
  for (let i = 1; i <= 2; i++) {
    const bookingId = `BK-400${i}`;
    const date = '2024-04-12';
    const booking: Booking = {
      id: bookingId,
      date,
      customer: customers[(i + 2) % customers.length],
      amount: 85.00,
      currency: 'EUR',
      status: 'confirmed',
    };
    const ticketId = `TK-600${i}`;
    records.push({
      id: ticketId,
      booking,
      ticket: {
        id: ticketId,
        bookingId,
        receivedDate: date,
        pdfUrl: '#',
        status: 'received',
        confidenceScore: 95,
        passengerName: `${booking.customer}`,
      },
      transaction: undefined, // Missing transaction
      overallStatus: 'manual_review',
      issueType: 'unmatched_purchase',
      confidence: 30,
    });
  }

  // Add "Partially Matched" (2 items)
  for (let i = 1; i <= 2; i++) {
    const bookingId = `BK-500${i}`;
    const date = '2024-04-15';
    const booking: Booking = {
      id: bookingId,
      date,
      customer: customers[(i + 4) % customers.length],
      amount: 200.00,
      currency: 'EUR',
      status: 'confirmed',
    };
    const ticketId = `TK-700${i}`;
    records.push({
      id: ticketId,
      booking,
      ticket: {
        id: ticketId,
        bookingId,
        receivedDate: date,
        pdfUrl: '#',
        status: 'received',
        confidenceScore: 100,
        passengerName: `${booking.customer}`,
      },
      overallStatus: 'manual_review',
      issueType: 'partially_matched',
      confidence: 60,
    });
  }

  // Add "Confidence Score Low" (2 items)
  for (let i = 1; i <= 2; i++) {
    const bookingId = `BK-600${i}`;
    const date = '2024-04-18';
    const booking: Booking = {
      id: bookingId,
      date,
      customer: customers[i % customers.length],
      amount: 120.00,
      currency: 'EUR',
      status: 'confirmed',
    };
    const ticketId = `TK-800${i}`;
    records.push({
      id: ticketId,
      booking,
      ticket: {
        id: ticketId,
        bookingId,
        receivedDate: date,
        pdfUrl: '#',
        status: 'received',
        confidenceScore: 68,
        passengerName: `${booking.customer}`,
      },
      overallStatus: 'manual_review',
      issueType: 'low_confidence',
      confidence: 68,
    });
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
