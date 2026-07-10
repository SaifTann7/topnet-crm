package com.topnet.crm.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String jobTitle;
    private String department;
    private boolean active;
    private Set<String> roles;
    private Instant createdAt;
    private Instant updatedAt;
}
