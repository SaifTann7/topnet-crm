package com.topnet.crm.customer.repository;

import com.topnet.crm.customer.entity.CustomerAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerAuditLogRepository extends JpaRepository<CustomerAuditLog, Long> {
    Page<CustomerAuditLog> findByCustomerIdOrderByPerformedAtDesc(Long customerId, Pageable pageable);
    List<CustomerAuditLog> findTop20ByCustomerIdOrderByPerformedAtDesc(Long customerId);
}
