package com.topnet.crm.user.mapper;

import com.topnet.crm.authentication.dto.AuthResponse;
import com.topnet.crm.user.dto.UserRequest;
import com.topnet.crm.user.dto.UserResponse;
import com.topnet.crm.user.entity.Role;
import com.topnet.crm.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .jobTitle(user.getJobTitle())
                .department(user.getDepartment())
                .active(user.isActive())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public AuthResponse.UserSummary toUserSummary(User user) {
        return AuthResponse.UserSummary.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                .build();
    }

    public void updateFromRequest(User user, UserRequest request) {
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setJobTitle(request.getJobTitle());
        user.setDepartment(request.getDepartment());
        user.setActive(request.isActive());
    }
}
