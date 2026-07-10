package com.topnet.crm.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DashboardRecentCustomerDto {
    private Long id;
    private String companyName;
    private String contactName;
    private String email;
    private String status;
    private String industry;
    private Instant createdAt;
}
