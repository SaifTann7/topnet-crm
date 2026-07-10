package com.topnet.crm.user.service;

import com.topnet.crm.common.dto.PageResponse;
import com.topnet.crm.common.util.PaginationUtils;
import com.topnet.crm.exception.BusinessException;
import com.topnet.crm.user.dto.UserRequest;
import com.topnet.crm.user.dto.UserResponse;
import com.topnet.crm.user.entity.Role;
import com.topnet.crm.user.entity.User;
import com.topnet.crm.user.mapper.UserMapper;
import com.topnet.crm.user.repository.RoleRepository;
import com.topnet.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findAll(Pageable pageable) {
        Page<UserResponse> page = userRepository.findAll(pageable).map(userMapper::toResponse);
        return PaginationUtils.toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUserOrThrow(id));
    }

    @Transactional
    public UserResponse create(UserRequest request, String rawPassword) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw BusinessException.conflict("Email already exists");
        }
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .jobTitle(request.getJobTitle())
                .department(request.getDepartment())
                .active(request.isActive())
                .roles(resolveRoles(request.getRoles()))
                .build();
        User saved = userRepository.save(user);
        log.info("User created: id={}, email={}", saved.getId(), saved.getEmail());
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = getUserOrThrow(id);
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw BusinessException.conflict("Email already exists");
        }
        userMapper.updateFromRequest(user, request);
        user.setRoles(resolveRoles(request.getRoles()));
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void deactivate(Long id) {
        User user = getUserOrThrow(id);
        user.setActive(false);
        userRepository.save(user);
        log.info("User deactivated: id={}", id);
    }

    @Transactional(readOnly = true)
    public long countActiveUsers() {
        return userRepository.findAll().stream().filter(User::isActive).count();
    }

    private User getUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("User", id));
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        return roleNames.stream()
                .map(name -> roleRepository.findByName(name)
                        .orElseThrow(() -> BusinessException.badRequest("Role not found: " + name)))
                .collect(Collectors.toSet());
    }
}
