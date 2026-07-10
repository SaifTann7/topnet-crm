/**
 * TOPNET CRM — Spring Boot entry point.
 * <p>
 * Demonstration application simulating an enterprise production system
 * for external Application Portfolio Management (APM) platform discovery.
 * Business logic is intentionally simple; deployment and observability are production-grade.
 */
package com.topnet.crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TopnetCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(TopnetCrmApplication.class, args);
    }
}
