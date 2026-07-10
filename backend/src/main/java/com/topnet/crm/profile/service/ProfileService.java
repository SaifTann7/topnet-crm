package com.topnet.crm.profile.service;

import com.topnet.crm.exception.BusinessException;
import com.topnet.crm.profile.dto.ChangePasswordRequest;
import com.topnet.crm.profile.dto.ProfileUpdateRequest;
import com.topnet.crm.security.SecurityUtils;
import com.topnet.crm.user.dto.UserResponse;
import com.topnet.crm.user.entity.User;
import com.topnet.crm.user.mapper.UserMapper;
import com.topnet.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getProfile() {
        return userMapper.toResponse(getCurrentUser());
    }

    @Transactional
    public UserResponse updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentUser();

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getJobTitle() != null) {
            user.setJobTitle(request.getJobTitle());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }

        User saved = userRepository.save(user);
        log.info("Profile updated for user id={}", saved.getId());
        return userMapper.toResponse(saved);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw BusinessException.badRequest("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user id={}", user.getId());
    }

    private User getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw BusinessException.unauthorized("Not authenticated");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> BusinessException.unauthorized("User not found"));
    }
}
