package com.topnet.crm.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {

    private long totalCustomers;
    private long activeCustomers;
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long totalUsers;
    private BigDecimal estimatedRevenue;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> ticketsByStatus;
    private List<DashboardRecentTicketDto> recentTickets;
    private List<DashboardRecentCustomerDto> recentCustomers;
    private List<DashboardNotificationDto> notifications;
}
