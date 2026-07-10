package com.topnet.crm.customer.repository;

import com.topnet.crm.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {
    boolean existsByEmailAndDeletedAtIsNull(String email);
    Optional<Customer> findByEmailAndDeletedAtIsNull(String email);
    Optional<Customer> findByEmail(String email);
    long countByStatus(String status);
    List<Customer> findTop5ByOrderByCreatedAtDesc();
    List<Customer> findAllByOrderByCompanyNameAsc();
}
