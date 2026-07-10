package com.topnet.crm.apm;

import com.topnet.crm.apm.dto.ApplicationInfoResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/application")
@Tag(name = "APM Discovery", description = "Application metadata for external APM platforms")
public class ApplicationInfoController {

    private final ApmDiscoveryService apmDiscoveryService;

    public ApplicationInfoController(ApmDiscoveryService apmDiscoveryService) {
        this.apmDiscoveryService = apmDiscoveryService;
    }

    @GetMapping(value = "/info", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Application discovery metadata for APM platforms")
    public ApplicationInfoResponse getApplicationInfo() {
        return apmDiscoveryService.getApplicationInfo();
    }
}
