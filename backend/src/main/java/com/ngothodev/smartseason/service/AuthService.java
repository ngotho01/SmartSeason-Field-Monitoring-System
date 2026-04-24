package com.ngothodev.smartseason.service;

import com.ngothodev.smartseason.dto.AuthDtos.AuthResponse;
import com.ngothodev.smartseason.dto.AuthDtos.LoginRequest;
import com.ngothodev.smartseason.repository.UserRepository;
import com.ngothodev.smartseason.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest req) {
        var auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
        );
        var user = userRepository.findByUsername(req.username()).orElseThrow();
        String token = jwtService.generateToken((UserDetails) auth.getPrincipal());

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getRole().name()
        );
    }
}