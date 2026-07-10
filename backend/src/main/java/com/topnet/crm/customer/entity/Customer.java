package com.topnet.crm.customer.entity;

import com.topnet.crm.common.entity.BaseEntity;
import com.topnet.crm.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;

@Entity
@Table(name = "customers")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_name", nullable = false, length = 200)
    private String contactName;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String address;

    private String city;

    private String country;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "ACTIVE";

    private String industry;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
