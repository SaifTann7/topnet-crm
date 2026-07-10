package com.topnet.crm.ticket.service;

import com.topnet.crm.common.dto.PageResponse;
import com.topnet.crm.common.util.PaginationUtils;
import com.topnet.crm.customer.entity.Customer;
import com.topnet.crm.customer.service.CustomerService;
import com.topnet.crm.exception.BusinessException;
import com.topnet.crm.ticket.dto.*;
import com.topnet.crm.ticket.entity.Ticket;
import com.topnet.crm.ticket.entity.TicketActivityType;
import com.topnet.crm.ticket.entity.TicketPriority;
import com.topnet.crm.ticket.entity.TicketStatus;
import com.topnet.crm.ticket.mapper.TicketMapper;
import com.topnet.crm.ticket.repository.TicketRepository;
import com.topnet.crm.user.entity.User;
import com.topnet.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.Year;
import java.util.Arrays;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CustomerService customerService;
    private final UserRepository userRepository;
    private final TicketMapper ticketMapper;
    private final TicketActivityService activityService;

    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> findAll(
            String search,
            TicketStatus status,
            TicketPriority priority,
            Long customerId,
            Long assignedToId,
            Boolean unassigned,
            Pageable pageable) {
        Specification<Ticket> spec = buildSpecification(search, status, priority, customerId, assignedToId, unassigned);
        Page<TicketResponse> page = ticketRepository.findAll(spec, pageable).map(ticketMapper::toResponse);
        return PaginationUtils.toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public TicketResponse findById(Long id) {
        return ticketMapper.toResponse(getTicketOrThrow(id));
    }

    @Transactional(readOnly = true)
    public TicketStatisticsResponse getStatistics() {
        Map<String, Long> byPriority = Arrays.stream(TicketPriority.values())
                .collect(Collectors.toMap(Enum::name, ticketRepository::countByPriority));

        return TicketStatisticsResponse.builder()
                .total(ticketRepository.count())
                .open(ticketRepository.countByStatus(TicketStatus.OPEN))
                .inProgress(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS))
                .resolved(ticketRepository.countByStatus(TicketStatus.RESOLVED))
                .closed(ticketRepository.countByStatus(TicketStatus.CLOSED))
                .byPriority(byPriority)
                .unassigned(ticketRepository.countByAssignedToIsNull())
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<AssignableUserResponse> getAssignableUsers() {
        return userRepository.findByActiveTrueOrderByFirstNameAsc().stream()
                .map(user -> AssignableUserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFirstName() + " " + user.getLastName())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.List<TicketTimelineItemResponse> getTimeline(Long id) {
        getTicketOrThrow(id);
        return activityService.getTimeline(id);
    }

    @Transactional(readOnly = true)
    public java.util.List<TicketCommentResponse> getComments(Long id) {
        getTicketOrThrow(id);
        return activityService.getComments(id);
    }

    @Transactional
    public TicketCommentResponse addComment(Long id, TicketCommentRequest request) {
        Ticket ticket = getTicketOrThrow(id);
        return activityService.addComment(ticket, request);
    }

    @Transactional
    public TicketResponse create(TicketRequest request) {
        Customer customer = customerService.getCustomerOrThrow(request.getCustomerId());
        User assignedTo = resolveAssignedUser(request.getAssignedToId());
        String ticketNumber = generateTicketNumber();

        Ticket ticket = ticketMapper.toEntity(request, customer, assignedTo, ticketNumber);
        Ticket saved = ticketRepository.save(ticket);

        activityService.log(saved.getId(), TicketActivityType.CREATED,
                "Ticket created: " + saved.getTicketNumber());
        if (assignedTo != null) {
            activityService.logChange(saved.getId(), TicketActivityType.ASSIGNED,
                    "Assigned to " + assignedTo.getFirstName() + " " + assignedTo.getLastName(),
                    "assignedTo", null, assignedTo.getEmail());
        }

        log.info("Ticket created: number={}, id={}", saved.getTicketNumber(), saved.getId());
        return ticketMapper.toResponse(saved);
    }

    @Transactional
    public TicketResponse update(Long id, TicketRequest request) {
        Ticket ticket = getTicketOrThrow(id);
        Customer customer = customerService.getCustomerOrThrow(request.getCustomerId());

        logFieldChange(ticket, id, "subject", ticket.getSubject(), request.getSubject());
        logFieldChange(ticket, id, "priority", ticket.getPriority().name(), request.getPriority().name());

        User previousAssignee = ticket.getAssignedTo();
        User newAssignee = resolveAssignedUser(request.getAssignedToId());
        if (!Objects.equals(
                previousAssignee != null ? previousAssignee.getId() : null,
                newAssignee != null ? newAssignee.getId() : null)) {
            if (newAssignee == null) {
                activityService.logChange(id, TicketActivityType.UNASSIGNED,
                        "Ticket unassigned",
                        "assignedTo",
                        previousAssignee != null ? previousAssignee.getEmail() : null,
                        null);
            } else {
                activityService.logChange(id, TicketActivityType.ASSIGNED,
                        "Assigned to " + newAssignee.getFirstName() + " " + newAssignee.getLastName(),
                        "assignedTo",
                        previousAssignee != null ? previousAssignee.getEmail() : null,
                        newAssignee.getEmail());
            }
        }

        ticket.setSubject(request.getSubject());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setCustomer(customer);
        ticket.setAssignedTo(newAssignee);

        activityService.log(id, TicketActivityType.UPDATED, "Ticket details updated");
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse updateStatus(Long id, TicketStatusUpdateRequest request) {
        Ticket ticket = getTicketOrThrow(id);
        TicketStatus previous = ticket.getStatus();
        ticket.setStatus(request.getStatus());

        if (request.getStatus() == TicketStatus.RESOLVED || request.getStatus() == TicketStatus.CLOSED) {
            ticket.setResolvedAt(Instant.now());
        } else {
            ticket.setResolvedAt(null);
        }

        TicketActivityType type = request.getStatus() == TicketStatus.RESOLVED
                ? TicketActivityType.RESOLVED
                : request.getStatus() == TicketStatus.CLOSED
                ? TicketActivityType.CLOSED
                : TicketActivityType.STATUS_CHANGED;

        activityService.logChange(id, type,
                "Status changed from " + previous + " to " + request.getStatus(),
                "status", previous.name(), request.getStatus().name());

        log.info("Ticket status updated: id={}, status={}", id, request.getStatus());
        return ticketMapper.toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public void delete(Long id) {
        Ticket ticket = getTicketOrThrow(id);
        activityService.log(id, TicketActivityType.DELETED, "Ticket deleted: " + ticket.getTicketNumber());
        ticketRepository.delete(ticket);
        log.info("Ticket deleted: id={}", id);
    }

    @Transactional(readOnly = true)
    public long countAll() {
        return ticketRepository.count();
    }

    @Transactional(readOnly = true)
    public long countByStatus(TicketStatus status) {
        return ticketRepository.countByStatus(status);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> countByPriority() {
        return Arrays.stream(TicketPriority.values())
                .collect(Collectors.toMap(Enum::name, ticketRepository::countByPriority));
    }

    public Ticket getTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Ticket", id));
    }

    private Specification<Ticket> buildSpecification(
            String search,
            TicketStatus status,
            TicketPriority priority,
            Long customerId,
            Long assignedToId,
            Boolean unassigned) {
        Specification<Ticket> spec = Specification.where(null);

        if (StringUtils.hasText(search)) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> {
                var assignee = root.join("assignedTo", JoinType.LEFT);
                return cb.or(
                        cb.like(cb.lower(root.get("ticketNumber")), pattern),
                        cb.like(cb.lower(root.get("subject")), pattern),
                        cb.like(cb.lower(root.get("customer").get("companyName")), pattern),
                        cb.like(cb.lower(assignee.get("firstName")), pattern),
                        cb.like(cb.lower(assignee.get("lastName")), pattern),
                        cb.like(cb.lower(assignee.get("email")), pattern)
                );
            });
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (priority != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priority"), priority));
        }
        if (customerId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("customer").get("id"), customerId));
        }
        if (Boolean.TRUE.equals(unassigned)) {
            spec = spec.and((root, query, cb) -> cb.isNull(root.get("assignedTo")));
        } else if (assignedToId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedTo").get("id"), assignedToId));
        }
        return spec;
    }

    private void logFieldChange(Ticket ticket, Long id, String field, String oldVal, String newVal) {
        if (!Objects.equals(oldVal, newVal)) {
            TicketActivityType type = "priority".equals(field)
                    ? TicketActivityType.PRIORITY_CHANGED
                    : TicketActivityType.UPDATED;
            activityService.logChange(id, type,
                    field + " changed",
                    field, oldVal, newVal);
        }
    }

    private User resolveAssignedUser(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("User", userId));
    }

    private String generateTicketNumber() {
        String candidate;
        do {
            candidate = "TKT-" + Year.now().getValue() + "-" + String.format("%06d", (long) (Math.random() * 1_000_000));
        } while (ticketRepository.existsByTicketNumber(candidate));
        return candidate;
    }
}
