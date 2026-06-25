// Contract shapes consumed by the dashboard frontend. These intentionally
// differ from the DB row shapes — services map DB rows into these.

export type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue';
  issuedDate: string;
  dueDate: string;
};

export type InvoicePreview = {
  latest: Invoice | null;
  incoming: Invoice | null;
};

export type SeatSummary = {
  used: number;
  total: number;
};

export type Seat = {
  id: string;
  seatNumber: string;
  assignedTo: string | null;
  status: 'occupied' | 'vacant' | 'reserved';
  assignedDate: string | null;
};

export type ServiceRequest = {
  id: string;
  reference: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
};
