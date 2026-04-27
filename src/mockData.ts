import type { GoldenRecord, Booking, Ticket, Transaction } from './types';

const customers = ['Marco Rossi', 'Giulia Bianchi', 'Luca Verdi', 'Elena Neri', 'Alessandro Gallo', 'Sofia Conti'];
const descriptions = ['TICKET FLIGHT ROM-MIL', 'TRAIN TICKET IT-772', 'BUS TRANSFER VCE', 'FERRY TICKET NAP-CAP'];

export const generateMockData = (): GoldenRecord[] => {
  const records: GoldenRecord[] = [];

  for (let i = 1; i <= 50; i++) {
    const id = `REC-${1000 + i}`;
    const date = new Date(2024, 3, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
    const amount = parseFloat((Math.random() * 200 + 50).toFixed(2));
    
    const booking: Booking = {
      id: `BK-${2000 + i}`,
      date,
      customer: customers[i % customers.length],
      amount,
      currency: 'EUR',
      status: 'confirmed',
    };

    let ticket: Ticket | undefined;
    let transaction: Transaction | undefined;
    let status: GoldenRecord['overallStatus'] = 'matched';
    let confidence = 100;

    // Simulate different scenarios
    if (i % 10 === 0) {
      // Missing PDF
      status = 'partial';
      confidence = 60;
      transaction = {
        id: `TX-${3000 + i}`,
        date,
        amount,
        currency: 'EUR',
        description: descriptions[i % descriptions.length],
        source: 'Revolut',
        bookingId: booking.id,
      };
    } else if (i % 7 === 0) {
      // Low confidence - Manual Review
      status = 'manual_review';
      confidence = 75;
      ticket = {
        id: `TK-${4000 + i}`,
        bookingId: booking.id,
        receivedDate: date,
        pdfUrl: '#',
        status: 'received',
        confidenceScore: 75,
      };
      transaction = {
        id: `TX-${3000 + i}`,
        date,
        amount: amount + (Math.random() > 0.5 ? 0.01 : -0.01), // Slight discrepancy
        currency: 'EUR',
        description: descriptions[i % descriptions.length],
        source: 'Revolut',
        bookingId: booking.id,
      };
    } else {
      // Perfect Match
      ticket = {
        id: `TK-${4000 + i}`,
        bookingId: booking.id,
        receivedDate: date,
        pdfUrl: '#',
        status: 'received',
        confidenceScore: 98,
      };
      transaction = {
        id: `TX-${3000 + i}`,
        date,
        amount,
        currency: 'EUR',
        description: descriptions[i % descriptions.length],
        source: 'Revolut',
        bookingId: booking.id,
      };
    }

    records.push({
      id,
      booking,
      ticket,
      transaction,
      overallStatus: status,
      confidence,
    });
  }

  return records;
};
