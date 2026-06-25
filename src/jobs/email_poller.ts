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
  if (msg.body?.content) {
    if (msg.body.contentType === 'HTML') {
      return stripHtml(msg.body.content);
    }
    return msg.body.content;
  }
  return msg.bodyPreview ?? '';
}

async function handleMessage(msg: GraphMessage): Promise<void> {
  const sender = msg.from?.emailAddress;

  console.log('---');
  console.log(`[poller] From:     ${sender?.name} <${sender?.address}>`);
  console.log(`[poller] Subject:  ${msg.subject}`);
  console.log(`[poller] Received: ${msg.receivedDateTime}`);

  const { result, error } = await emailProcessingService.processAndForward({
    from: {
      name: sender?.name ?? '',
      address: sender?.address ?? 'unknown@unknown',
    },
    subject: msg.subject ?? '(no subject)',
    body: extractPlainBody(msg),
  });

  if (error) {
    console.error(`[poller] Pipeline failed: ${error.message}`);
    return;
  }

  console.log(`[poller] Forwarded to ${result?.forwarded_to}`);

  const { error: readErr } = await emailService.markAsRead(msg.id);
  if (readErr) {
    console.error(`[poller] Failed to mark as read: ${readErr.message}`);
  } else {
    console.log(`[poller] Marked as read`);
  }
}

async function pollOnce(): Promise<void> {
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
}

export function startEmailPoller(): void {
  console.log(
    `[poller] Starting email poller for ${env.MS_GRAPH_USER_EMAIL}, interval=${env.EMAIL_POLL_INTERVAL_MS}ms`
  );

  pollOnce();
  setInterval(pollOnce, env.EMAIL_POLL_INTERVAL_MS);
}
