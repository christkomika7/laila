export type MessageStatus = "NEW" | "READ";

export type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
};
