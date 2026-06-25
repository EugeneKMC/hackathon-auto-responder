export const EmailIntent = {
  GET_INVOICES: 'get_invoices',
  CHECK_INVOICE_STATUS: 'check_invoice_status',
  CHECK_AVAILABILITY: 'check_availability',
  REQUEST_QUOTE: 'request_quote',
  BOOK_TOUR: 'book_tour',
  REPORT_ISSUE: 'report_issue',
  GENERAL_INQUIRY: 'general_inquiry',
  UNKNOWN: 'unknown',
} as const;

export type EmailIntent = (typeof EmailIntent)[keyof typeof EmailIntent];
