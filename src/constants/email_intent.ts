export const EmailIntent = {
  GET_INVOICES: 'get_invoices',
  CHECK_INVOICE_STATUS: 'check_invoice_status',
  SEAT_INQUIRY: 'seat_inquiry',
  SEAT_CHANGE_REQUEST: 'seat_change_request',
  SUBMIT_TICKET: 'submit_ticket',
  CHECK_TICKET_STATUS: 'check_ticket_status',
  CONTRACT_QUERY: 'contract_query',
  ACCOUNT_SUMMARY: 'account_summary',
  GENERAL_INQUIRY: 'general_inquiry',
  UNKNOWN: 'unknown',
} as const;

export type EmailIntent = (typeof EmailIntent)[keyof typeof EmailIntent];
