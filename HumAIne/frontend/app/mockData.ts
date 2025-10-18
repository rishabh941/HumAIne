import type { PendingRequest, UnresolvedRequest, KnowledgeEntry, AskResponse, LiveKitTokenResponse, SystemStats } from '@/lib/types';

// Data for global state store
export const mockStore = {
  user: {
    id: "supervisor_001" as const,
    name: "John Supervisor" as const,
    role: "supervisor" as const
  },
  connectionStatus: "disconnected" as const
};

// Data returned by API queries
export const mockQuery = {
  pendingRequests: [
    {
      _id: "req_001" as const,
      customer_id: "customer_123" as const,
      question: "How do I reset my password?" as const,
      created_at: "2024-01-15T10:30:00Z" as const,
      status: "pending" as const
    },
    {
      _id: "req_002" as const,
      customer_id: "customer_456" as const,
      question: "What are your business hours?" as const,
      created_at: "2024-01-15T11:45:00Z" as const,
      status: "pending" as const
    }
  ],
  unresolvedRequests: [
    {
      _id: "req_003" as const,
      customer_id: "customer_789" as const,
      question: "Can I get a refund?" as const,
      created_at: "2024-01-14T09:20:00Z" as const,
      status: "unresolved" as const
    }
  ],
  knowledgeEntries: [
    {
      _id: "kb_001" as const,
      question_key: "How do I reset my password?" as const,
      answer: "You can reset your password by clicking the 'Forgot Password' link on the login page." as const,
      created_at: "2024-01-10T14:00:00Z" as const
    },
    {
      _id: "kb_002" as const,
      question_key: "What are your business hours?" as const,
      answer: "We are open Monday to Friday, 9 AM to 6 PM EST." as const,
      created_at: "2024-01-12T16:30:00Z" as const
    }
  ],
  askResponse: {
    answer: "You can reset your password by clicking the 'Forgot Password' link on the login page." as const,
    from_kb: true as const,
    message: "Answer found in knowledge base" as const,
    request_id: "req_004" as const
  },
  livekitToken: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." as const,
    room_name: "humaine_room" as const
  },
  stats: {
    totalQuestions: 156,
    resolvedCount: 142,
    pendingCount: 8,
    knowledgeCount: 89
  }
};

// Data passed as props to the root component
export const mockRootProps = {
  initialTab: "pending" as const,
  roomName: "humaine_room" as const,
  participantName: "Supervisor" as const
};