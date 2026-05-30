export type SendEmailInput = {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  idempotencyKey?: string;
};

export type SendEmailResult = { id: string };

export class EmailSendError extends Error {
  constructor(message = "Email send failed") {
    super(message);
    this.name = "EmailSendError";
  }
}

export interface EmailSender {
  readonly provider: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
