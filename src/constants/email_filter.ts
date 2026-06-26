import { EmailIntent } from '@/constants/email_intent';
import { env } from '@/utils/env';

// Sender address substrings that mark an email as automated/no-reply. The
// poller skips these so it never forwards or replies to notification mail.
export const AUTOMATED_SENDER_PATTERNS = [
  'no-reply',
  'noreply',
  'no_reply',
  'donotreply',
  'do-not-reply',
  'mailer-daemon',
  'postmaster',
] as const;

export function isAutomatedSender(address: string): boolean {
  const normalized = address.trim().toLowerCase();
  if (!normalized) return true;
  // Never act on our own mailbox (avoids self-reply loops).
  if (normalized === env.MS_GRAPH_USER_EMAIL.toLowerCase()) return true;
  return AUTOMATED_SENDER_PATTERNS.some((pattern) =>
    normalized.includes(pattern)
  );
}

export function isForwardableIntent(intent: EmailIntent): boolean {
  return intent !== EmailIntent.UNKNOWN;
}
