package com.topnet.crm.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class UserRequest {

    @NotBlank @Email
    private String email;

    @NotBlank @Size(max = 100)
    private String firstName;

    @NotBlank @Size(max = 100)
    private String lastName;

    @Size(max = 30)
    private String phone;

    @Size(max = 150)
    private String jobTitle;

    @Size(max = 100)
    private String department;

    private boolean active = true;

    @NotEmpty(message = "At least one role is required")
    private Set<String> roles;
}
