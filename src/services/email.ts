import { env } from '@/utils/env';
import { graphFetch } from '@/config/msgraph';
import { ServiceResponse } from '@/utils/service_response';
import type {
  GraphMessage,
  GraphMessageList,
} from '@/types/email';
import type {
  SendEmailPayload,
  SendReplyPayload,
} from '@/schemas/email';

const MAILBOX = encodeURIComponent(env.MS_GRAPH_USER_EMAIL);

const LIST_SELECT =
  'id,subject,from,bodyPreview,body,uniqueBody,receivedDateTime,isRead';
const DETAIL_SELECT =
  'id,subject,from,toRecipients,body,bodyPreview,receivedDateTime,isRead';

export const emailService = {
  async listUnreadMessages(top = 25) {
    try {
      const since = new Date(
        Date.now() - env.POLL_LOOKBACK_HOURS * 60 * 60 * 1000
      ).toISOString();
      const filter = `isRead eq false and receivedDateTime ge ${since}`;
      const path =
        `/users/${MAILBOX}/messages` +
        `?$select=${LIST_SELECT}` +
        `&$filter=${encodeURIComponent(filter)}` +
        `&$orderby=${encodeURIComponent('receivedDateTime desc')}` +
        `&$top=${top}`;
      const data = await graphFetch<GraphMessageList>(path);
      return ServiceResponse.success(data.value);
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to list unread messages',
        err instanceof Error ? err.message : err
      );
    }
  },

  async listRecentMessages(top = 25) {
    try {
      const path =
        `/users/${MAILBOX}/messages` +
        `?$select=${LIST_SELECT}` +
        `&$orderby=${encodeURIComponent('receivedDateTime desc')}` +
        `&$top=${top}`;
      const data = await graphFetch<GraphMessageList>(path);
      return ServiceResponse.success(data.value);
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to list messages',
        err instanceof Error ? err.message : err
      );
    }
  },

  async getMessageById(messageId: string) {
    try {
      const data = await graphFetch<GraphMessage>(
        `/users/${MAILBOX}/messages/${messageId}?$select=${DETAIL_SELECT}`
      );
      return ServiceResponse.success(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes(' 404 ')) {
        return ServiceResponse.notFound('Message not found');
      }
      return ServiceResponse.internalServerError(
        'Failed to fetch message',
        message
      );
    }
  },

  async markAsRead(messageId: string) {
    try {
      await graphFetch(`/users/${MAILBOX}/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true }),
      });
      return ServiceResponse.success({ messageId, isRead: true });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to mark message as read',
        err instanceof Error ? err.message : err
      );
    }
  },

  async replyToMessage(messageId: string, payload: SendReplyPayload) {
    try {
      await graphFetch(`/users/${MAILBOX}/messages/${messageId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ comment: payload.content }),
      });
      return ServiceResponse.success({ messageId, replied: true });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to reply to message',
        err instanceof Error ? err.message : err
      );
    }
  },

  // Sends an HTML reply that lives in the same conversation thread as the
  // original message. Three-step Graph flow: createReply -> patch body -> send.
  async sendHtmlReplyInThread(messageId: string, html: string) {
    try {
      const draft = await graphFetch<{ id: string }>(
        `/users/${MAILBOX}/messages/${messageId}/createReply`,
        { method: 'POST' }
      );
      await graphFetch(`/users/${MAILBOX}/messages/${draft.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          body: { contentType: 'HTML', content: html },
        }),
      });
      await graphFetch(`/users/${MAILBOX}/messages/${draft.id}/send`, {
        method: 'POST',
      });
      return ServiceResponse.success({ messageId, draftId: draft.id });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to send threaded reply',
        err instanceof Error ? err.message : err
      );
    }
  },

  async sendEmail(payload: SendEmailPayload) {
    try {
      const message = {
        message: {
          subject: payload.subject,
          body: {
            contentType: payload.isHtml ? 'HTML' : 'Text',
            content: payload.content,
          },
          toRecipients: payload.to.map((address) => ({
            emailAddress: { address },
          })),
          ccRecipients: (payload.cc ?? []).map((address) => ({
            emailAddress: { address },
          })),
        },
        saveToSentItems: true,
      };

      await graphFetch(`/users/${MAILBOX}/sendMail`, {
        method: 'POST',
        body: JSON.stringify(message),
      });

      return ServiceResponse.success({ sent: true });
    } catch (err) {
      return ServiceResponse.internalServerError(
        'Failed to send email',
        err instanceof Error ? err.message : err
      );
    }
  },
};
