package com.topnet.crm.customer.dto;

import com.topnet.crm.customer.entity.CustomerAuditAction;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CustomerAuditLogResponse {
    private Long id;
    private Long customerId;
    private CustomerAuditAction action;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String performedBy;
    private Instant performedAt;
}
