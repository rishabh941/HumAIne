// Enums for the HumAIne application
export enum RequestStatus {
  PENDING = "pending",
  UNRESOLVED = "unresolved",
  RESOLVED = "resolved"
}

export enum SupervisorTab {
  PENDING = "pending",
  UNRESOLVED = "unresolved",
  RESOLVED = "resolved"
}

export type ConnectionStatus = "connected" | "disconnected" | "connecting";

// Query types (API response data)
export interface PendingRequest {
  _id: string;
  customer_id: string;
  question: string;
  created_at: string;
  status: string;
}

export interface UnresolvedRequest {
  _id: string;
  customer_id: string;
  question: string;
  created_at: string;
  status: string;
}

export interface KnowledgeEntry {
  _id: string;
  question_key: string;
  answer: string;
  created_at: string;
}

export interface AskResponse {
  answer?: string;
  from_kb?: boolean;
  message?: string;
  request_id?: string;
}

export interface LiveKitTokenResponse {
  token: string;
  room_name: string;
}

export interface SystemStats {
  totalQuestions: number;
  resolvedCount: number;
  pendingCount: number;
  knowledgeCount: number;
}

export interface EventLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
}