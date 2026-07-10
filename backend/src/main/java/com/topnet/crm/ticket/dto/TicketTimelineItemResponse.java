package com.topnet.crm.ticket.dto;

import com.topnet.crm.ticket.entity.TicketActivityType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TicketTimelineItemResponse {
    private Long id;
    private Long ticketId;
    private TicketActivityType activityType;
    private String description;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String performedBy;
    private Instant performedAt;
}
