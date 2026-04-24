package com.ngothodev.smartseason.service;

import com.ngothodev.smartseason.dto.UserDtos.*;
import com.ngothodev.smartseason.exception.ResourceNotFoundException;
import com.ngothodev.smartseason.model.Role;
import com.ngothodev.smartseason.model.User;
import com.ngothodev.smartseason.repository.FieldRepository;
import com.ngothodev.smartseason.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FieldRepository fieldRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> listAgents() {
        return userRepository.findByRole(Role.AGENT).stream().map(this::toDto).toList();
    }

    public List<AgentWithFieldsResponse> listAgentsWithFieldCount() {
        return userRepository.findByRole(Role.AGENT).stream()
                .map(a -> new AgentWithFieldsResponse(
                        a.getId(),
                        a.getUsername(),
                        a.getFullName(),
                        fieldRepository.findByAgentId(a.getId()).size()
                ))
                .toList();
    }

    @Transactional
    public UserResponse createAgent(CreateAgentRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        User agent = User.builder()
                .username(req.username())
                .fullName(req.fullName())
                .password(passwordEncoder.encode(req.password()))
                .role(Role.AGENT)
                .build();
        return toDto(userRepository.save(agent));
    }

    @Transactional
    public void deleteAgent(Long id) {
        User agent = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found: " + id));
        if (agent.getRole() != Role.AGENT) {
            throw new IllegalArgumentException("Can only delete AGENT users");
        }
        long assigned = fieldRepository.findByAgentId(id).size();
        if (assigned > 0) {
            throw new IllegalArgumentException(
                    "Cannot delete agent with " + assigned + " assigned field(s). Reassign them first.");
        }
        userRepository.delete(agent);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private UserResponse toDto(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getFullName(), u.getRole().name());
    }
}