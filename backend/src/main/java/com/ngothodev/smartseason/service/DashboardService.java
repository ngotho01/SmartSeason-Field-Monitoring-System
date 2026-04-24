package com.ngothodev.smartseason.service;

import com.ngothodev.smartseason.dto.DashboardDtos.*;
import com.ngothodev.smartseason.model.*;
import com.ngothodev.smartseason.repository.FieldRepository;
import com.ngothodev.smartseason.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FieldRepository fieldRepository;
    private final UserRepository userRepository;
    private final FieldStatusService statusService;
    private final FieldUpdateService fieldUpdateService;
    private final UserService userService;

    public AdminDashboard forAdmin() {
        List<Field> fields = fieldRepository.findAll();

        Map<String, Long> statusBreakdown = fields.stream()
                .collect(Collectors.groupingBy(f -> statusService.compute(f).name(), Collectors.counting()));

        Map<String, Long> stageBreakdown = fields.stream()
                .collect(Collectors.groupingBy(f -> f.getCurrentStage().name(), Collectors.counting()));

        List<User> agents = userRepository.findByRole(Role.AGENT);
        List<AgentSummary> agentSummaries = agents.stream()
                .map(a -> new AgentSummary(
                        a.getId(),
                        a.getFullName(),
                        fields.stream().filter(f -> f.getAgent() != null && f.getAgent().getId().equals(a.getId())).count()
                )).toList();

        return new AdminDashboard(
                fields.size(),
                statusBreakdown,
                stageBreakdown,
                agents.size(),
                agentSummaries,
                fieldUpdateService.recentForAdmin()
        );
    }

    public AgentDashboard forAgent(String username) {
        User agent = userService.findByUsername(username);
        List<Field> fields = fieldRepository.findByAgentId(agent.getId());

        Map<String, Long> statusBreakdown = fields.stream()
                .collect(Collectors.groupingBy(f -> statusService.compute(f).name(), Collectors.counting()));

        Map<String, Long> stageBreakdown = fields.stream()
                .collect(Collectors.groupingBy(f -> f.getCurrentStage().name(), Collectors.counting()));

        return new AgentDashboard(
                fields.size(),
                statusBreakdown,
                stageBreakdown,
                fieldUpdateService.recentForAgent(agent.getId())
        );
    }
}