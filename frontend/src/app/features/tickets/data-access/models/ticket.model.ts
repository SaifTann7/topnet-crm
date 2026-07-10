export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketActivityType =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'UPDATED'
  | 'COMMENT_ADDED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'DELETED';

export const TICKET_STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const TICKET_PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export interface Ticket {
  id: number;
  ticketNumber: string;
  subject: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: number;
  customerName?: string;
  assignedToId?: number;
  assignedToName?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRequest {
  subject: string;
  description?: string;
  priority: TicketPriority;
  customerId: number;
  assignedToId?: number;
}

export interface TicketStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: Record<TicketPriority, number>;
  unassigned: number;
}

export interface AssignableUser {
  id: number;
  email: string;
  fullName: string;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  body: string;
  authorEmail: string;
  authorName: string;
  createdAt: string;
}

export interface TicketTimelineItem {
  id: number;
  ticketId: number;
  activityType: TicketActivityType;
  description?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedAt: string;
}

export interface TicketListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  customerId?: number;
  assignedToId?: number;
  unassigned?: boolean;
  sort?: string;
}
