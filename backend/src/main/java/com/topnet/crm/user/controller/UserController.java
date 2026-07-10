package com.topnet.crm.user.controller;

import com.topnet.crm.common.dto.PageResponse;
import com.topnet.crm.user.dto.UserCreateRequest;
import com.topnet.crm.user.dto.UserRequest;
import com.topnet.crm.user.dto.UserResponse;
import com.topnet.crm.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management (Admin/Manager only)")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List all users with pagination")
    public PageResponse<UserResponse> findAll(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return userService.findAll(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public UserResponse findById(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new user")
    public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
        return userService.create(request, request.getPassword());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return userService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Deactivate a user")
    public void deactivate(@PathVariable Long id) {
        userService.deactivate(id);
    }
}
