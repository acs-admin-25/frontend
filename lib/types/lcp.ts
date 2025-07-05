export interface LCPEmailRequest {
  to: string[];
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
  attachments?: LCPAttachment[];
}

export interface LCPAttachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface LCPAnalytics {
  totalThreads: number;
  activeThreads: number;
  totalMessages: number;
  averageResponseTime: number;
  satisfactionScore: number;
  monthlyGrowth: number;
} 