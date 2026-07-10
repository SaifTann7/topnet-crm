package com.topnet.crm.dashboard.controller;

import com.topnet.crm.dashboard.dto.DashboardStatsResponse;
import com.topnet.crm.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "CRM analytics and KPIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get aggregated CRM dashboard statistics")
    public DashboardStatsResponse getStats() {
        return dashboardService.getStats();
    }
}
