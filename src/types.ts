export type ReconciliationStatus = 'matched' | 'partial' | 'failed' | 'manual_review';

export type Booking = {
  id: string;
  date: string;
  customer: string;
  amount: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled';
};

export type Ticket = {
  id: string;
  bookingId: string;
  receivedDate: string;
  pdfUrl: string;
  status: 'received' | 'missing';
  confidenceScore: number;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  source: 'Revolut';
  bookingId?: string;
};

export type GoldenRecord = {
  id: string;
  booking: Booking;
  ticket?: Ticket;
  transaction?: Transaction;
  overallStatus: ReconciliationStatus;
  confidence: number;
};
