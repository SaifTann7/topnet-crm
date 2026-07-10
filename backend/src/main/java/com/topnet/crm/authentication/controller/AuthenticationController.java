package com.topnet.crm.authentication.controller;

import com.topnet.crm.authentication.dto.AuthResponse;
import com.topnet.crm.authentication.dto.ForgotPasswordRequest;
import com.topnet.crm.authentication.dto.LoginRequest;
import com.topnet.crm.authentication.dto.MessageResponse;
import com.topnet.crm.authentication.dto.RegisterRequest;
import com.topnet.crm.authentication.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, registration and session management")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    @Operation(summary = "Authenticate and receive JWT access token")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authenticationService.login(request);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new agent account")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authenticationService.register(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user summary")
    public AuthResponse.UserSummary me() {
        return authenticationService.getCurrentUser();
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset link")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authenticationService.requestPasswordReset(request.getEmail());
    }
}
