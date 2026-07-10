export interface DashboardRecentTicket {
  id: number;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  customerName?: string;
  createdAt: string;
}

export interface DashboardRecentCustomer {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  status: string;
  industry?: string;
  createdAt: string;
}

export interface DashboardNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  totalUsers: number;
  estimatedRevenue: number;
  ticketsByPriority: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  recentTickets: DashboardRecentTicket[];
  recentCustomers: DashboardRecentCustomer[];
  notifications: DashboardNotification[];
}

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
  percentage: number;
}
