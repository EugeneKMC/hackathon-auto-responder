import { describe, it, expect } from 'bun:test';
import {
  isAutomatedSender,
  isForwardableIntent,
} from '@/constants/email_filter';
import { EmailIntent } from '@/constants/email_intent';
import { env } from '@/utils/env';

describe('isAutomatedSender', () => {
  it('flags no-reply style senders', () => {
    expect(isAutomatedSender('no-reply@kmc.solutions')).toBe(true);
    expect(isAutomatedSender('azure-noreply@microsoft.com')).toBe(true);
    expect(isAutomatedSender('docs@email.pandadoc.net')).toBe(false);
    expect(isAutomatedSender('MAILER-DAEMON@example.com')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isAutomatedSender('No-Reply@KMC.Solutions')).toBe(true);
  });

  it('treats the bot mailbox as automated (no self-reply)', () => {
    expect(isAutomatedSender(env.MS_GRAPH_USER_EMAIL)).toBe(true);
  });

  it('treats an empty address as automated', () => {
    expect(isAutomatedSender('')).toBe(true);
    expect(isAutomatedSender('   ')).toBe(true);
  });

  it('allows genuine human senders', () => {
    expect(isAutomatedSender('jane@acme.com')).toBe(false);
    expect(isAutomatedSender('glaiza.sarmiento@kmc.solutions')).toBe(false);
  });
});

describe('isForwardableIntent', () => {
  it('rejects unknown intent', () => {
    expect(isForwardableIntent(EmailIntent.UNKNOWN)).toBe(false);
  });

  it('accepts actionable intents', () => {
    expect(isForwardableIntent(EmailIntent.GET_INVOICES)).toBe(true);
    expect(isForwardableIntent(EmailIntent.GENERAL_INQUIRY)).toBe(true);
    expect(isForwardableIntent(EmailIntent.REPORT_ISSUE)).toBe(true);
  });
});
