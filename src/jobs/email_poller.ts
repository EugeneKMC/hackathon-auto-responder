import { env } from '@/utils/env';
import { emailService } from '@/services/email';
import { emailProcessingService } from '@/services/email_processing';
import type { GraphMessage } from '@/types/email';

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPlainBody(msg: GraphMessage): string {
  // Use the full body (NOT uniqueBody) so quoted thread context from
  // earlier turns of the conversation is preserved. The agent reads
  // that quoted history to handle follow-up replies correctly.
  const source = msg.body;
  if (source?.content) {
    if (source.contentType === 'HTML') {
      return stripHtml(source.content);
    }
    return source.content;
  }
  return msg.bodyPreview ?? '';
}

const inflightIds = new Set<string>();
let pollInFlight = false;

async function handleMessage(msg: GraphMessage): Promise<void> {
  if (inflightIds.has(msg.id)) {
    console.log(`[poller] Already processing ${msg.id} — skipping duplicate`);
    return;
  }
  inflightIds.add(msg.id);

  const sender = msg.from?.emailAddress;

  console.log('---');
  console.log(`[poller] From:     ${sender?.name} <${sender?.address}>`);
  console.log(`[poller] Subject:  ${msg.subject}`);
  console.log(`[poller] Received: ${msg.receivedDateTime}`);

  try {
  const { result, error } = await emailProcessingService.processAndForward(
    {
      from: {
        name: sender?.name ?? '',
        address: sender?.address ?? 'unknown@unknown',
      },
      subject: msg.subject ?? '(no subject)',
      body: extractPlainBody(msg),
    },
    { replyToMessageId: msg.id }
  );

  if (error || !result) {
    console.error(`[poller] Pipeline failed: ${error?.message}`);
    return;
  }

  if (result && 'skipped' in result && result.skipped) {
    console.log(`[poller] Skipped: ${result.reason}`);
  } else if (result && 'forwarded_to' in result) {
    console.log(`[poller] Forwarded to ${result.forwarded_to}`);
  }

  const { error: readErr } = await emailService.markAsRead(msg.id);
  if (readErr) {
    console.error(`[poller] Failed to mark as read: ${readErr.message}`);
  } else {
    console.log(`[poller] Marked as read`);
  }
  } finally {
    inflightIds.delete(msg.id);
  }
}

async function pollOnce(): Promise<void> {
  if (pollInFlight) {
    console.log('[poller] Previous poll still running — skipping this tick');
    return;
  }
  pollInFlight = true;

  try {
  const startedAt = new Date().toISOString();

  const { result: messages, error } = await emailService.listUnreadMessages();

  if (error) {
    console.error(
      `[poller ${startedAt}] Error: ${error.message}`,
      error.details ?? ''
    );
    return;
  }

  if (!messages || messages.length === 0) {
    console.log(`[poller ${startedAt}] No unread messages`);
    return;
  }

  console.log(
    `[poller ${startedAt}] Found ${messages.length} unread message(s)`
  );

  for (const msg of messages) {
    await handleMessage(msg);
  }
  } finally {
    pollInFlight = false;
  }
}

export function startEmailPoller(): void {
  console.log(
    `[poller] Starting email poller for ${env.MS_GRAPH_USER_EMAIL}, interval=${env.EMAIL_POLL_INTERVAL_MS}ms`
  );

  const tick = async () => {
    try {
      await pollOnce();
    } catch (err) {
      console.error('[poller] Unexpected error in pollOnce:', err);
    }
    setTimeout(tick, env.EMAIL_POLL_INTERVAL_MS);
  };
  tick();
}
