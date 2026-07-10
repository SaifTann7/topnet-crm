package com.topnet.crm.user.dto;

import com.topnet.crm.validation.StrongPassword;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserCreateRequest extends UserRequest {

    @NotBlank
    @StrongPassword
    private String password;
}
