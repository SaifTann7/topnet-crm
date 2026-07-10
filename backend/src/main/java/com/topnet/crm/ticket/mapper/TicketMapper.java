package com.topnet.crm.ticket.mapper;

import com.topnet.crm.customer.entity.Customer;
import com.topnet.crm.ticket.dto.TicketRequest;
import com.topnet.crm.ticket.dto.TicketResponse;
import com.topnet.crm.ticket.entity.Ticket;
import com.topnet.crm.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public TicketResponse toResponse(Ticket ticket) {
        Customer customer = ticket.getCustomer();
        User assigned = ticket.getAssignedTo();
        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getCompanyName() : null)
                .assignedToId(assigned != null ? assigned.getId() : null)
                .assignedToName(assigned != null ? assigned.getFirstName() + " " + assigned.getLastName() : null)
                .resolvedAt(ticket.getResolvedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }

    public Ticket toEntity(TicketRequest request, Customer customer, User assignedTo, String ticketNumber) {
        return Ticket.builder()
                .ticketNumber(ticketNumber)
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority())
                .customer(customer)
                .assignedTo(assignedTo)
                .build();
    }
}
