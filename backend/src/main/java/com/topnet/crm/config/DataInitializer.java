package com.topnet.crm.config;

import com.topnet.crm.customer.entity.Customer;
import com.topnet.crm.customer.repository.CustomerRepository;
import com.topnet.crm.ticket.entity.Ticket;
import com.topnet.crm.ticket.entity.TicketPriority;
import com.topnet.crm.ticket.entity.TicketStatus;
import com.topnet.crm.ticket.repository.TicketRepository;
import com.topnet.crm.user.entity.Role;
import com.topnet.crm.user.entity.User;
import com.topnet.crm.user.repository.RoleRepository;
import com.topnet.crm.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        ensureRoles();
        User admin = ensureAdminUser();
        seedDemoData(admin);
    }

    private void ensureRoles() {
        createRoleIfMissing("ROLE_ADMIN", "System administrator with full access");
        createRoleIfMissing("ROLE_MANAGER", "Team manager with elevated permissions");
        createRoleIfMissing("ROLE_AGENT", "Support agent handling tickets and customers");
    }

    private void createRoleIfMissing(String name, String description) {
        roleRepository.findByName(name).orElseGet(() ->
                roleRepository.save(Role.builder().name(name).description(description).build()));
    }

    private User ensureAdminUser() {
        return userRepository.findByEmail("admin@topnet.com").map(user -> {
            if (!passwordEncoder.matches("Admin@123", user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode("Admin@123"));
                userRepository.save(user);
            }
            return user;
        }).orElseGet(() -> {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();
            User admin = User.builder()
                    .email("admin@topnet.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .firstName("System")
                    .lastName("Administrator")
                    .phone("+1-555-0100")
                    .jobTitle("System Admin")
                    .department("IT")
                    .active(true)
                    .roles(Set.of(adminRole))
                    .build();
            User saved = userRepository.save(admin);
            log.info("Default admin created: admin@topnet.com / Admin@123");
            return saved;
        });
    }

    private void seedDemoData(User admin) {
        if (customerRepository.count() > 0) {
            return;
        }

        Customer acme = customerRepository.save(Customer.builder()
                .companyName("Acme Corporation")
                .contactName("John Smith")
                .email("john.smith@acme.com")
                .phone("+1-555-1001")
                .city("San Francisco")
                .country("USA")
                .industry("Technology")
                .status("ACTIVE")
                .assignedTo(admin)
                .build());

        customerRepository.save(Customer.builder()
                .companyName("Global Industries")
                .contactName("Sarah Johnson")
                .email("sarah.j@globalind.com")
                .phone("+1-555-1002")
                .city("Chicago")
                .country("USA")
                .industry("Manufacturing")
                .status("ACTIVE")
                .assignedTo(admin)
                .build());

        ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-2026-000001")
                .subject("Unable to access customer portal")
                .description("Customer reports login failures since yesterday.")
                .status(TicketStatus.OPEN)
                .priority(TicketPriority.HIGH)
                .customer(acme)
                .assignedTo(admin)
                .build());

        ticketRepository.save(Ticket.builder()
                .ticketNumber("TKT-2026-000002")
                .subject("Billing inquiry")
                .description("Request for updated invoice copy.")
                .status(TicketStatus.IN_PROGRESS)
                .priority(TicketPriority.MEDIUM)
                .customer(acme)
                .assignedTo(admin)
                .build());

        log.info("Demo customers and tickets seeded");
    }
}
