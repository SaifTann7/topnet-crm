package com.topnet.crm.authentication.service;

import com.topnet.crm.authentication.dto.AuthResponse;
import com.topnet.crm.authentication.dto.ForgotPasswordRequest;
import com.topnet.crm.authentication.dto.LoginRequest;
import com.topnet.crm.authentication.dto.MessageResponse;
import com.topnet.crm.authentication.dto.RegisterRequest;
import com.topnet.crm.exception.BusinessException;
import com.topnet.crm.security.JwtProperties;
import com.topnet.crm.security.JwtTokenProvider;
import com.topnet.crm.security.SecurityUtils;
import com.topnet.crm.user.entity.Role;
import com.topnet.crm.user.entity.User;
import com.topnet.crm.user.mapper.UserMapper;
import com.topnet.crm.user.repository.RoleRepository;
import com.topnet.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email={}", request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtTokenProvider.generateToken(userDetails);
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpirationMs())
                .user(userMapper.toUserSummary(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw BusinessException.conflict("Email is already registered");
        }

        Role agentRole = roleRepository.findByName("ROLE_AGENT")
                .orElseThrow(() -> BusinessException.badRequest("Default role ROLE_AGENT not found"));

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .active(true)
                .roles(Set.of(agentRole))
                .build();
        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtTokenProvider.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpirationMs())
                .user(userMapper.toUserSummary(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse.UserSummary getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        if (email == null) {
            throw BusinessException.unauthorized("Not authenticated");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> BusinessException.unauthorized("User not found"));
        return userMapper.toUserSummary(user);
    }

    public MessageResponse requestPasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user ->
                log.info("Password reset requested for user id={}", user.getId()));
        return MessageResponse.builder()
                .message("If an account exists for this email, password reset instructions have been sent.")
                .build();
    }
}
