package com.topnet.crm.customer.service;

import com.topnet.crm.customer.dto.CustomerAuditLogResponse;
import com.topnet.crm.customer.entity.CustomerAuditAction;
import com.topnet.crm.customer.entity.CustomerAuditLog;
import com.topnet.crm.customer.repository.CustomerAuditLogRepository;
import com.topnet.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CustomerAuditService {

    private final CustomerAuditLogRepository auditLogRepository;

    @Transactional
    public void log(Long customerId, CustomerAuditAction action, String fieldName, String oldValue, String newValue) {
        auditLogRepository.save(CustomerAuditLog.builder()
                .customerId(customerId)
                .action(action)
                .fieldName(fieldName)
                .oldValue(oldValue)
                .newValue(newValue)
                .performedBy(resolveActor())
                .build());
    }

    @Transactional
    public void logAction(Long customerId, CustomerAuditAction action, String details) {
        log(customerId, action, null, null, details);
    }

    @Transactional(readOnly = true)
    public List<CustomerAuditLogResponse> getLogsForCustomer(Long customerId) {
        return auditLogRepository.findTop20ByCustomerIdOrderByPerformedAtDesc(customerId).stream()
                .map(this::toResponse)
                .toList();
    }

    private CustomerAuditLogResponse toResponse(CustomerAuditLog log) {
        return CustomerAuditLogResponse.builder()
                .id(log.getId())
                .customerId(log.getCustomerId())
                .action(log.getAction())
                .fieldName(log.getFieldName())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .performedBy(log.getPerformedBy())
                .performedAt(log.getPerformedAt())
                .build();
    }

    private String resolveActor() {
        return Objects.requireNonNullElse(SecurityUtils.getCurrentUserEmail(), "system");
    }
}
