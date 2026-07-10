package com.topnet.crm.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI topnetCrmOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("TOPNET CRM API")
                        .description("""
                                Enterprise demonstration API for APM portfolio discovery.
                                Modules: Authentication, Users, Customers, Tickets, Dashboard, Profile.
                                Discovery: /actuator/health, /actuator/info, /application/info
                                """)
                        .version("1.0.0")
                        .contact(new Contact().name("TOPNET").email("admin@topnet.com")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
