export type MessageFolder =
  | "inbox"
  | "archive"
  | "outbox"
  | "drafts"
  | "appointments";

export interface Message {
  wilmaId: number;
  subject: string;
  sentAt: Date;
  folder: MessageFolder | string;
  senderId?: number | null;
  senderType?: number | null;
  senderName?: string | null;
  sendersJson?: Record<string, unknown> | null;
  status?: number | null;
  content?: string | null;
  fetchedAt: Date;
}

export interface NewsItem {
  wilmaId: number;
  title: string;
  subtitle?: string | null;
  author?: string | null;
  published?: Date | null;
  content?: string | null;
  fetchedAt: Date;
}

export interface Exam {
  wilmaId: number;
  examDate: Date;
  subject: string;
  description?: string | null;
  teacher?: string | null;
  notes?: string | null;
  fetchedAt: Date;
}

export interface StudentInfo {
  studentNumber: string;
  name: string;
  href: string;
}

export interface Municipality {
  nameFi: string;
  nameSv: string;
}

export interface TenantInfo {
  url: string;
  name: string;
  municipalities: Municipality[];
  formerUrl?: string | null;
}

export interface TenantDiscoveryResponse {
  wilmat: TenantInfo[];
}

export interface WilmaProfile {
  baseUrl: string;
  username: string;
  password: string;
  studentNumber?: string | null;
}