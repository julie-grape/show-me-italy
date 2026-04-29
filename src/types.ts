export type ReconciliationStatus = 'matched' | 'partial' | 'failed' | 'manual_review';
export type IssueType = 'unmatched_purchase' | 'partially_matched' | 'low_confidence' | 'pdf_missing';

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
  passengerName: string;
};

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  source: 'Revolut' | 'Fareharbor' | 'Gmail';
  bookingId?: string;
};

export type GoldenRecord = {
  id: string; // This will be the ticket ID or a combined ID
  booking: Booking;
  ticket: Ticket;
  transaction?: Transaction;
  overallStatus: ReconciliationStatus;
  issueType?: IssueType;
  confidence: number;
};

export type RawData = {
  fareharbor: Record<string, unknown>[];
  revolut: Record<string, unknown>[];
  gmail: Record<string, unknown>[];
};
