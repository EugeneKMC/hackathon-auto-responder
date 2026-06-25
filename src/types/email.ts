export type GraphEmailAddress = {
  name: string;
  address: string;
};

export type GraphMessageBody = {
  contentType: 'Text' | 'HTML';
  content: string;
};

export type GraphMessage = {
  id: string;
  subject: string | null;
  bodyPreview: string;
  body?: GraphMessageBody;
  uniqueBody?: GraphMessageBody;
  receivedDateTime: string;
  isRead: boolean;
  from: {
    emailAddress: GraphEmailAddress;
  };
  toRecipients?: { emailAddress: GraphEmailAddress }[];
};

export type GraphMessageList = {
  value: GraphMessage[];
  '@odata.nextLink'?: string;
};
