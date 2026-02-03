package com.marketim.backend.dashboard;

import com.marketim.backend.dashboard.dto.DashboardSummaryResponse;
import com.marketim.backend.dashboard.dto.RevenueChartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketim.backend.dashboard.dto.StatusChartResponse;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryResponse summary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/status-chart")
    public StatusChartResponse statusChart(@RequestParam String range) {
        return dashboardService.getStatusChart(range);
    }

    @GetMapping("/revenue-chart")
    public RevenueChartResponse revenueChart(
            @RequestParam(defaultValue = "week") String range
    ) {
        return dashboardService.getRevenueChart(range);
    }

}




