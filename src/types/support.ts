import { Timestamp } from "firebase-admin/firestore";

export type TicketCategory = "bug" | "feature_request" | "account" | "billing" | "other";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface TicketResponse {
  id: string;
  message: string;
  authorId: string;
  authorEmail: string;
  authorName?: string;
  isAdmin: boolean;
  createdAt: Timestamp;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  userId: string;
  userEmail: string;
  brandId?: string | null;
  responses: TicketResponse[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  assignedTo?: string;
  resolvedAt?: Timestamp;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: TicketCategory;
  userId: string;
  userEmail: string;
  brandId?: string | null;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  assignedTo?: string;
  response?: {
    message: string;
    authorId: string;
    authorEmail: string;
    authorName?: string;
    isAdmin: boolean;
  };
}