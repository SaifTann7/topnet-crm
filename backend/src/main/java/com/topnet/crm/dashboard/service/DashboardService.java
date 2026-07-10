package com.topnet.crm.dashboard.service;

import com.topnet.crm.customer.entity.Customer;
import com.topnet.crm.customer.repository.CustomerRepository;
import com.topnet.crm.customer.service.CustomerService;
import com.topnet.crm.dashboard.dto.DashboardNotificationDto;
import com.topnet.crm.dashboard.dto.DashboardRecentCustomerDto;
import com.topnet.crm.dashboard.dto.DashboardRecentTicketDto;
import com.topnet.crm.dashboard.dto.DashboardStatsResponse;
import com.topnet.crm.ticket.entity.Ticket;
import com.topnet.crm.ticket.entity.TicketStatus;
import com.topnet.crm.ticket.repository.TicketRepository;
import com.topnet.crm.ticket.service.TicketService;
import com.topnet.crm.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final BigDecimal AVG_CONTRACT_VALUE = new BigDecimal("15000");

    private final CustomerService customerService;
    private final TicketService ticketService;
    private final UserService userService;
    private final TicketRepository ticketRepository;
    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        long activeCustomers = customerService.countByStatus("ACTIVE");
        List<Ticket> recentTicketEntities = ticketRepository.findTop5ByOrderByCreatedAtDesc();
        List<Customer> recentCustomerEntities = customerRepository.findTop5ByOrderByCreatedAtDesc();

        return DashboardStatsResponse.builder()
                .totalCustomers(customerService.countAll())
                .activeCustomers(activeCustomers)
                .totalTickets(ticketService.countAll())
                .openTickets(ticketService.countByStatus(TicketStatus.OPEN))
                .inProgressTickets(ticketService.countByStatus(TicketStatus.IN_PROGRESS))
                .resolvedTickets(ticketService.countByStatus(TicketStatus.RESOLVED))
                .totalUsers(userService.countActiveUsers())
                .estimatedRevenue(AVG_CONTRACT_VALUE.multiply(BigDecimal.valueOf(activeCustomers)))
                .ticketsByPriority(ticketService.countByPriority())
                .ticketsByStatus(countTicketsByStatus())
                .recentTickets(mapRecentTickets(recentTicketEntities))
                .recentCustomers(mapRecentCustomers(recentCustomerEntities))
                .notifications(buildNotifications(recentTicketEntities, recentCustomerEntities))
                .build();
    }

    private Map<String, Long> countTicketsByStatus() {
        return Arrays.stream(TicketStatus.values())
                .collect(Collectors.toMap(Enum::name, ticketService::countByStatus));
    }

    private List<DashboardRecentTicketDto> mapRecentTickets(List<Ticket> tickets) {
        return tickets.stream()
                .map(t -> DashboardRecentTicketDto.builder()
                        .id(t.getId())
                        .ticketNumber(t.getTicketNumber())
                        .subject(t.getSubject())
                        .status(t.getStatus().name())
                        .priority(t.getPriority().name())
                        .customerName(t.getCustomer() != null ? t.getCustomer().getCompanyName() : null)
                        .createdAt(t.getCreatedAt())
                        .build())
                .toList();
    }

    private List<DashboardRecentCustomerDto> mapRecentCustomers(List<Customer> customers) {
        return customers.stream()
                .map(c -> DashboardRecentCustomerDto.builder()
                        .id(c.getId())
                        .companyName(c.getCompanyName())
                        .contactName(c.getContactName())
                        .email(c.getEmail())
                        .status(c.getStatus())
                        .industry(c.getIndustry())
                        .createdAt(c.getCreatedAt())
                        .build())
                .toList();
    }

    private List<DashboardNotificationDto> buildNotifications(List<Ticket> tickets, List<Customer> customers) {
        List<DashboardNotificationDto> notifications = new ArrayList<>();
        AtomicLong id = new AtomicLong(1);

        tickets.forEach(t -> notifications.add(DashboardNotificationDto.builder()
                .id(id.getAndIncrement())
                .title("Ticket " + t.getTicketNumber())
                .message(t.getSubject() + " — " + t.getStatus().name().replace('_', ' '))
                .type("TICKET")
                .read(false)
                .createdAt(t.getCreatedAt())
                .build()));

        customers.forEach(c -> notifications.add(DashboardNotificationDto.builder()
                .id(id.getAndIncrement())
                .title("Customer " + c.getCompanyName())
                .message("New account onboarded — " + c.getContactName())
                .type("CUSTOMER")
                .read(false)
                .createdAt(c.getCreatedAt())
                .build()));

        notifications.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return notifications.stream().limit(6).toList();
    }
}
