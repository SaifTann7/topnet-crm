package com.topnet.crm.ticket.controller;

import com.topnet.crm.common.dto.PageResponse;
import com.topnet.crm.ticket.dto.*;
import com.topnet.crm.ticket.entity.TicketPriority;
import com.topnet.crm.ticket.entity.TicketStatus;
import com.topnet.crm.ticket.service.TicketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Support ticket management")
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    @Operation(summary = "List tickets with search, filters, pagination and sorting")
    public PageResponse<TicketResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) Boolean unassigned,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ticketService.findAll(search, status, priority, customerId, assignedToId, unassigned, pageable);
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get ticket statistics for dashboard widgets")
    public TicketStatisticsResponse getStatistics() {
        return ticketService.getStatistics();
    }

    @GetMapping("/assignees")
    @Operation(summary = "List users available for ticket assignment")
    public List<AssignableUserResponse> getAssignableUsers() {
        return ticketService.getAssignableUsers();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket by ID")
    public TicketResponse findById(@PathVariable Long id) {
        return ticketService.findById(id);
    }

    @GetMapping("/{id}/timeline")
    @Operation(summary = "Get ticket activity timeline")
    public List<TicketTimelineItemResponse> getTimeline(@PathVariable Long id) {
        return ticketService.getTimeline(id);
    }

    @GetMapping("/{id}/comments")
    @Operation(summary = "Get ticket comments")
    public List<TicketCommentResponse> getComments(@PathVariable Long id) {
        return ticketService.getComments(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a comment to a ticket")
    public TicketCommentResponse addComment(@PathVariable Long id, @Valid @RequestBody TicketCommentRequest request) {
        return ticketService.addComment(id, request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new support ticket")
    public TicketResponse create(@Valid @RequestBody TicketRequest request) {
        return ticketService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ticket details")
    public TicketResponse update(@PathVariable Long id, @Valid @RequestBody TicketRequest request) {
        return ticketService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update ticket status")
    public TicketResponse updateStatus(@PathVariable Long id, @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ticketService.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a ticket")
    public void delete(@PathVariable Long id) {
        ticketService.delete(id);
    }
}
