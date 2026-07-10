package com.topnet.crm.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DashboardRecentTicketDto {
    private Long id;
    private String ticketNumber;
    private String subject;
    private String status;
    private String priority;
    private String customerName;
    private Instant createdAt;
}
