package com.topnet.crm.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CustomerRequest {

    @NotBlank @Size(max = 255)
    private String companyName;

    @NotBlank @Size(max = 200)
    private String contactName;

    @NotBlank @Email
    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 500)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String country;

    @Size(max = 30)
    private String status = "ACTIVE";

    @Size(max = 100)
    private String industry;

    private String notes;

    private Long assignedToId;
}
