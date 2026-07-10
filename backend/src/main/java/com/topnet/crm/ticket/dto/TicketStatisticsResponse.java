package com.topnet.crm.ticket.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class TicketStatisticsResponse {
    private long total;
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private Map<String, Long> byPriority;
    private long unassigned;
}
