export interface InsuranceApplication {
  id?: string;
  [key: string]: any;
}

export interface ChatMessage {
  id?: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "professional" | "admin";
  message: string;
  timestamp: Date;
  read: boolean;
}