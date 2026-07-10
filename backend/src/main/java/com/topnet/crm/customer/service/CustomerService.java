package com.topnet.crm.customer.service;

import com.topnet.crm.common.dto.PageResponse;
import com.topnet.crm.common.util.PaginationUtils;
import com.topnet.crm.customer.dto.CustomerImportResult;
import com.topnet.crm.customer.dto.CustomerRequest;
import com.topnet.crm.customer.dto.CustomerResponse;
import com.topnet.crm.customer.entity.Customer;
import com.topnet.crm.customer.entity.CustomerAuditAction;
import com.topnet.crm.customer.mapper.CustomerMapper;
import com.topnet.crm.customer.repository.CustomerRepository;
import com.topnet.crm.exception.BusinessException;
import com.topnet.crm.user.entity.User;
import com.topnet.crm.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private static final String CSV_HEADER = "companyName,contactName,email,phone,address,city,country,status,industry,notes";

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final CustomerMapper customerMapper;
    private final CustomerAuditService auditService;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> findAll(String search, String status, String industry, String country, Pageable pageable) {
        Specification<Customer> spec = buildSpecification(search, status, industry, country);
        Page<CustomerResponse> page = customerRepository.findAll(spec, pageable).map(customerMapper::toResponse);
        return PaginationUtils.toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        return customerMapper.toResponse(getCustomerOrThrow(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw BusinessException.conflict("Customer email already exists");
        }
        Customer customer = customerMapper.toEntity(request);
        customer.setAssignedTo(resolveAssignedUser(request.getAssignedToId()));
        Customer saved = customerRepository.save(customer);
        auditService.logAction(saved.getId(), CustomerAuditAction.CREATE, "Customer created: " + saved.getCompanyName());
        log.info("Customer created: id={}, company={}", saved.getId(), saved.getCompanyName());
        return customerMapper.toResponse(saved);
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = getCustomerOrThrow(id);
        customerRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(c -> { throw BusinessException.conflict("Customer email already exists"); });

        logFieldChange(customer, id, "companyName", customer.getCompanyName(), request.getCompanyName());
        logFieldChange(customer, id, "contactName", customer.getContactName(), request.getContactName());
        logFieldChange(customer, id, "email", customer.getEmail(), request.getEmail());
        logFieldChange(customer, id, "status", customer.getStatus(), request.getStatus());

        customerMapper.updateFromRequest(customer, request);
        customer.setAssignedTo(resolveAssignedUser(request.getAssignedToId()));
        Customer saved = customerRepository.save(customer);
        auditService.logAction(id, CustomerAuditAction.UPDATE, "Customer updated");
        return customerMapper.toResponse(saved);
    }

    @Transactional
    public void softDelete(Long id) {
        Customer customer = getCustomerOrThrow(id);
        customer.setDeletedAt(Instant.now());
        customerRepository.save(customer);
        auditService.logAction(id, CustomerAuditAction.DELETE, "Customer soft-deleted: " + customer.getCompanyName());
        log.info("Customer soft-deleted: id={}", id);
    }

    @Transactional(readOnly = true)
    public String exportCsv(String search, String status, String industry, String country) {
        Specification<Customer> spec = buildSpecification(search, status, industry, country);
        List<Customer> customers = customerRepository.findAll(spec, Pageable.unpaged()).getContent();

        StringBuilder csv = new StringBuilder(CSV_HEADER).append('\n');
        for (Customer c : customers) {
            csv.append(escape(c.getCompanyName())).append(',')
                    .append(escape(c.getContactName())).append(',')
                    .append(escape(c.getEmail())).append(',')
                    .append(escape(c.getPhone())).append(',')
                    .append(escape(c.getAddress())).append(',')
                    .append(escape(c.getCity())).append(',')
                    .append(escape(c.getCountry())).append(',')
                    .append(escape(c.getStatus())).append(',')
                    .append(escape(c.getIndustry())).append(',')
                    .append(escape(c.getNotes())).append('\n');
        }
        return csv.toString();
    }

    @Transactional
    public CustomerImportResult importCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("CSV file is required");
        }

        CustomerImportResult result = CustomerImportResult.builder().build();
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) {
                throw BusinessException.badRequest("CSV file is empty");
            }

            String line;
            int row = 1;
            while ((line = reader.readLine()) != null) {
                row++;
                if (line.isBlank()) continue;
                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    String[] cols = parseCsvLine(line);
                    if (cols.length < 3) {
                        throw new IllegalArgumentException("Expected at least companyName, contactName, email");
                    }
                    CustomerRequest request = new CustomerRequest();
                    request.setCompanyName(cols[0].trim());
                    request.setContactName(cols[1].trim());
                    request.setEmail(cols[2].trim());
                    if (cols.length > 3) request.setPhone(nullIfBlank(cols[3]));
                    if (cols.length > 4) request.setAddress(nullIfBlank(cols[4]));
                    if (cols.length > 5) request.setCity(nullIfBlank(cols[5]));
                    if (cols.length > 6) request.setCountry(nullIfBlank(cols[6]));
                    if (cols.length > 7 && StringUtils.hasText(cols[7])) request.setStatus(cols[7].trim());
                    if (cols.length > 8) request.setIndustry(nullIfBlank(cols[8]));
                    if (cols.length > 9) request.setNotes(nullIfBlank(cols[9]));

                    validateImportRow(request);
                    upsertImportedCustomer(request);
                    result.setSuccessCount(result.getSuccessCount() + 1);
                } catch (Exception ex) {
                    result.setFailureCount(result.getFailureCount() + 1);
                    errors.add("Row " + row + ": " + ex.getMessage());
                }
            }
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            throw BusinessException.badRequest("Failed to parse CSV: " + ex.getMessage());
        }

        result.setErrors(errors);
        return result;
    }

    @Transactional(readOnly = true)
    public long countAll() {
        return customerRepository.count();
    }

    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        return customerRepository.countByStatus(status);
    }

    public Customer getCustomerOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> BusinessException.notFound("Customer", id));
    }

    private void upsertImportedCustomer(CustomerRequest request) {
        Customer existing = findByEmailIncludingDeleted(request.getEmail());
        if (existing != null) {
            if (existing.getDeletedAt() != null) {
                existing.setDeletedAt(null);
            }
            customerMapper.updateFromRequest(existing, request);
            Customer saved = customerRepository.save(existing);
            auditService.logAction(saved.getId(), CustomerAuditAction.IMPORT, "Customer imported/updated via CSV");
        } else {
            Customer customer = customerMapper.toEntity(request);
            Customer saved = customerRepository.save(customer);
            auditService.logAction(saved.getId(), CustomerAuditAction.IMPORT, "Customer created via CSV import");
        }
    }

    @SuppressWarnings("unchecked")
    private Customer findByEmailIncludingDeleted(String email) {
        List<Customer> results = entityManager
                .createNativeQuery("SELECT * FROM customers WHERE email = :email", Customer.class)
                .setParameter("email", email)
                .getResultList();
        return results.isEmpty() ? null : results.getFirst();
    }

    private void validateImportRow(CustomerRequest request) {
        if (!StringUtils.hasText(request.getCompanyName())) throw new IllegalArgumentException("companyName is required");
        if (!StringUtils.hasText(request.getContactName())) throw new IllegalArgumentException("contactName is required");
        if (!StringUtils.hasText(request.getEmail()) || !request.getEmail().contains("@")) {
            throw new IllegalArgumentException("valid email is required");
        }
    }

    private Specification<Customer> buildSpecification(String search, String status, String industry, String country) {
        Specification<Customer> spec = Specification.where(null);

        if (StringUtils.hasText(search)) {
            String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("companyName")), pattern),
                    cb.like(cb.lower(root.get("contactName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("city")), pattern)
            ));
        }
        if (StringUtils.hasText(status)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (StringUtils.hasText(industry)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("industry"), industry));
        }
        if (StringUtils.hasText(country)) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("country"), country));
        }
        return spec;
    }

    private void logFieldChange(Customer customer, Long id, String field, String oldVal, String newVal) {
        if (!Objects.equals(oldVal, newVal)) {
            auditService.log(id, CustomerAuditAction.UPDATE, field, oldVal, newVal);
        }
    }

    private User resolveAssignedUser(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId)
                .orElseThrow(() -> BusinessException.notFound("User", userId));
    }

    private String escape(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        result.add(current.toString());
        return result.toArray(String[]::new);
    }

    private String nullIfBlank(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
