package com.topnet.crm.ticket.repository;

import com.topnet.crm.ticket.entity.TicketActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketActivityRepository extends JpaRepository<TicketActivity, Long> {
    List<TicketActivity> findByTicketIdOrderByPerformedAtDesc(Long ticketId);
}
