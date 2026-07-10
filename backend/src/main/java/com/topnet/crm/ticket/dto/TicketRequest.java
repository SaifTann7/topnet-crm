package com.topnet.crm.ticket.dto;

import com.topnet.crm.ticket.entity.TicketPriority;
import com.topnet.crm.ticket.entity.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank @Size(max = 255)
    private String subject;

    private String description;

    @NotNull
    private TicketPriority priority;

    @NotNull
    private Long customerId;

    private Long assignedToId;
}
