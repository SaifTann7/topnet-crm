package com.topnet.crm.ticket.repository;

import com.topnet.crm.ticket.entity.Ticket;
import com.topnet.crm.ticket.entity.TicketPriority;
import com.topnet.crm.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {
    boolean existsByTicketNumber(String ticketNumber);
    long countByStatus(TicketStatus status);
    long countByPriority(TicketPriority priority);
    long countByAssignedToIsNull();
    List<Ticket> findTop5ByOrderByCreatedAtDesc();
}
