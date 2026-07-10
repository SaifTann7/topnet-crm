package com.topnet.crm.customer.mapper;

import com.topnet.crm.customer.dto.CustomerRequest;
import com.topnet.crm.customer.dto.CustomerResponse;
import com.topnet.crm.customer.entity.Customer;
import com.topnet.crm.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerResponse toResponse(Customer customer) {
        User assigned = customer.getAssignedTo();
        return CustomerResponse.builder()
                .id(customer.getId())
                .companyName(customer.getCompanyName())
                .contactName(customer.getContactName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .city(customer.getCity())
                .country(customer.getCountry())
                .status(customer.getStatus())
                .industry(customer.getIndustry())
                .notes(customer.getNotes())
                .assignedToId(assigned != null ? assigned.getId() : null)
                .assignedToName(assigned != null ? assigned.getFirstName() + " " + assigned.getLastName() : null)
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    public Customer toEntity(CustomerRequest request) {
        return Customer.builder()
                .companyName(request.getCompanyName())
                .contactName(request.getContactName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .industry(request.getIndustry())
                .notes(request.getNotes())
                .build();
    }

    public void updateFromRequest(Customer customer, CustomerRequest request) {
        customer.setCompanyName(request.getCompanyName());
        customer.setContactName(request.getContactName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setCountry(request.getCountry());
        customer.setStatus(request.getStatus());
        customer.setIndustry(request.getIndustry());
        customer.setNotes(request.getNotes());
    }
}
