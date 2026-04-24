package com.ngothodev.smartseason.dto;

import java.util.List;
import java.util.Map;

public class DashboardDtos {

    public record AdminDashboard(
            long totalFields,
            Map<String, Long> statusBreakdown,
            Map<String, Long> stageBreakdown,
            long totalAgents,
            List<AgentSummary> agents,
            List<FieldUpdateDtos.UpdateResponse> recentUpdates
    ) {}

    public record AgentDashboard(
            long assignedFields,
            Map<String, Long> statusBreakdown,
            Map<String, Long> stageBreakdown,
            List<FieldUpdateDtos.UpdateResponse> recentUpdates
    ) {}

    public record AgentSummary(Long agentId, String fullName, long fieldCount) {}
}