package com.topnet.crm.customer.controller;

import com.topnet.crm.common.dto.PageResponse;
import com.topnet.crm.customer.dto.CustomerAuditLogResponse;
import com.topnet.crm.customer.dto.CustomerImportResult;
import com.topnet.crm.customer.dto.CustomerRequest;
import com.topnet.crm.customer.dto.CustomerResponse;
import com.topnet.crm.customer.service.CustomerAuditService;
import com.topnet.crm.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer relationship management")
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerAuditService auditService;

    @GetMapping
    @Operation(summary = "List customers with search, filters, pagination and sorting")
    public PageResponse<CustomerResponse> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String country,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return customerService.findAll(search, status, industry, country, pageable);
    }

    @GetMapping("/export")
    @Operation(summary = "Export customers to CSV")
    public ResponseEntity<String> exportCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String country) {
        String csv = customerService.exportCsv(search, status, industry, country);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=topnet-customers.csv")
                .contentType(new MediaType("text", "csv"))
                .body(csv);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import customers from CSV file")
    public CustomerImportResult importCsv(@RequestParam("file") MultipartFile file) {
        return customerService.importCsv(file);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public CustomerResponse findById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @GetMapping("/{id}/audit-logs")
    @Operation(summary = "Get audit logs for a customer")
    public List<CustomerAuditLogResponse> getAuditLogs(@PathVariable Long id) {
        customerService.findById(id);
        return auditService.getLogsForCustomer(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new customer")
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) {
        return customerService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing customer")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        return customerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft-delete a customer")
    public void delete(@PathVariable Long id) {
        customerService.softDelete(id);
    }
}
