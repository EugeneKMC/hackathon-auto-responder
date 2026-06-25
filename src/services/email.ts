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
  'id,subject,from,bodyPreview,body,receivedDateTime,isRead';
const DETAIL_SELECT =
  'id,subject,from,toRecipients,body,bodyPreview,receivedDateTime,isRead';

export const emailService = {
  async listUnreadMessages(top = 25) {
    try {
      const path =
        `/users/${MAILBOX}/messages` +
        `?$select=${LIST_SELECT}` +
        `&$filter=${encodeURIComponent('isRead eq false')}` +
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
