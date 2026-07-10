package com.topnet.crm.ticket.service;

import com.topnet.crm.security.SecurityUtils;
import com.topnet.crm.ticket.dto.TicketCommentRequest;
import com.topnet.crm.ticket.dto.TicketCommentResponse;
import com.topnet.crm.ticket.dto.TicketTimelineItemResponse;
import com.topnet.crm.ticket.entity.Ticket;
import com.topnet.crm.ticket.entity.TicketActivity;
import com.topnet.crm.ticket.entity.TicketActivityType;
import com.topnet.crm.ticket.entity.TicketComment;
import com.topnet.crm.ticket.repository.TicketActivityRepository;
import com.topnet.crm.ticket.repository.TicketCommentRepository;
import com.topnet.crm.user.entity.User;
import com.topnet.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TicketActivityService {

    private final TicketActivityRepository activityRepository;
    private final TicketCommentRepository commentRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(Long ticketId, TicketActivityType type, String description) {
        logChange(ticketId, type, description, null, null, null);
    }

    @Transactional
    public void logChange(Long ticketId, TicketActivityType type, String description,
                          String fieldName, String oldValue, String newValue) {
        activityRepository.save(TicketActivity.builder()
                .ticketId(ticketId)
                .activityType(type)
                .description(description)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .performedBy(resolveActor())
                .build());
    }

    @Transactional(readOnly = true)
    public List<TicketTimelineItemResponse> getTimeline(Long ticketId) {
        return activityRepository.findByTicketIdOrderByPerformedAtDesc(ticketId).stream()
                .map(this::toTimelineItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getComments(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @Transactional
    public TicketCommentResponse addComment(Ticket ticket, TicketCommentRequest request) {
        User currentUser = resolveCurrentUser();
        String authorName = currentUser != null
                ? currentUser.getFirstName() + " " + currentUser.getLastName()
                : "System";
        String authorEmail = currentUser != null ? currentUser.getEmail() : resolveActor();

        TicketComment comment = commentRepository.save(TicketComment.builder()
                .ticket(ticket)
                .body(request.getBody().trim())
                .authorEmail(authorEmail)
                .authorName(authorName)
                .build());

        log(ticket.getId(), TicketActivityType.COMMENT_ADDED,
                "Comment added by " + authorName);

        return toCommentResponse(comment);
    }

    private TicketTimelineItemResponse toTimelineItem(TicketActivity activity) {
        return TicketTimelineItemResponse.builder()
                .id(activity.getId())
                .ticketId(activity.getTicketId())
                .activityType(activity.getActivityType())
                .description(activity.getDescription())
                .fieldName(activity.getFieldName())
                .oldValue(activity.getOldValue())
                .newValue(activity.getNewValue())
                .performedBy(activity.getPerformedBy())
                .performedAt(activity.getPerformedAt())
                .build();
    }

    private TicketCommentResponse toCommentResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .body(comment.getBody())
                .authorEmail(comment.getAuthorEmail())
                .authorName(comment.getAuthorName())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private User resolveCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) return null;
        return userRepository.findByEmail(email).orElse(null);
    }

    private String resolveActor() {
        return Objects.requireNonNullElse(SecurityUtils.getCurrentUserEmail(), "system");
    }
}
