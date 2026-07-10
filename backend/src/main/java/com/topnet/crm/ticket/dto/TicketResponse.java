package com.topnet.crm.ticket.dto;

import com.topnet.crm.ticket.entity.TicketPriority;
import com.topnet.crm.ticket.entity.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TicketResponse {

    private Long id;
    private String ticketNumber;
    private String subject;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private Long customerId;
    private String customerName;
    private Long assignedToId;
    private String assignedToName;
    private Instant resolvedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
