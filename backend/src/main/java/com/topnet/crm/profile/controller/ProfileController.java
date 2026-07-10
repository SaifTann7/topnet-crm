package com.topnet.crm.profile.controller;

import com.topnet.crm.profile.dto.ChangePasswordRequest;
import com.topnet.crm.profile.dto.ProfileUpdateRequest;
import com.topnet.crm.profile.service.ProfileService;
import com.topnet.crm.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Authenticated user profile management")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @Operation(summary = "Get current user profile")
    public UserResponse getProfile() {
        return profileService.getProfile();
    }

    @PutMapping
    @Operation(summary = "Update current user profile")
    public UserResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        return profileService.updateProfile(request);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Change current user password")
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(request);
    }
}
