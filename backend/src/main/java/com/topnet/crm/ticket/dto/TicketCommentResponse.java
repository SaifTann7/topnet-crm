package com.topnet.crm.ticket.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TicketCommentResponse {
    private Long id;
    private Long ticketId;
    private String body;
    private String authorEmail;
    private String authorName;
    private Instant createdAt;
}
