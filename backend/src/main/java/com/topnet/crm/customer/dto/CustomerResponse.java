package com.topnet.crm.customer.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CustomerResponse {

    private Long id;
    private String companyName;
    private String contactName;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String status;
    private String industry;
    private String notes;
    private Long assignedToId;
    private String assignedToName;
    private Instant createdAt;
    private Instant updatedAt;
}
