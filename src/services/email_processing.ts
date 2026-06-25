import { runEmailIntentAgent } from '@/agents/email_intent_agent';
import { emailService } from '@/services/email';
import { ServiceResponse } from '@/utils/service_response';
import {
  isAutomatedSender,
  isForwardableIntent,
} from '@/constants/email_filter';
import type { ProcessEmailPayload } from '@/schemas/email_processing';

const FORWARD_TO = 'eugene.capalad@kmc.solutions';

function buildForwardBody(
  email: ProcessEmailPayload,
  intentJson: string
): string {
  return `=== Original Email ===
From: ${email.from.name} <${email.from.address}>
Subject: ${email.subject}

${email.body}

=== Agent Response (OpenAI structured output) ===
${intentJson}
`;
}

export const emailProcessingService = {
  async processEmail(email: ProcessEmailPayload) {
    try {
      const intent = await runEmailIntentAgent(email);
      return ServiceResponse.success({
        from: email.from,
        subject: email.subject,
        intent,
      });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to process email',
        err instanceof Error ? err.message : err
      );
    }
  },

  async processAndForward(email: ProcessEmailPayload) {
    // Cheap pre-filter: skip automated/no-reply senders before spending an
    // OpenAI call. Catches notification mail (Azure, ERP, PandaDoc, etc.).
    if (isAutomatedSender(email.from.address)) {
      return ServiceResponse.success({
        forwarded: false as const,
        reason: 'automated_sender' as const,
        intent: null,
      });
    }

    const { result, error } = await this.processEmail(email);
    if (error || !result) {
      return ServiceResponse.internalServerError(
        error?.message ?? 'Processing returned no result',
        error?.details
      );
    }

    // Intent post-filter: don't forward mail the agent couldn't classify.
    if (!isForwardableIntent(result.intent.intent)) {
      return ServiceResponse.success({
        forwarded: false as const,
        reason: 'non_forwardable_intent' as const,
        intent: result.intent.intent,
      });
    }

    const intentJson = JSON.stringify(result.intent, null, 2);
    const forwardBody = buildForwardBody(email, intentJson);

    const { error: sendErr } = await emailService.sendEmail({
      to: [FORWARD_TO],
      subject: `[Auto-Responder] ${email.subject}`,
      content: forwardBody,
      isHtml: false,
    });

    if (sendErr) {
      return ServiceResponse.internalServerError(
        `Failed to forward to ${FORWARD_TO}: ${sendErr.message}`,
        sendErr.details
      );
    }

    return ServiceResponse.success({
      forwarded: true as const,
      forwarded_to: FORWARD_TO,
      intent: result.intent.intent,
    });
  },
};
