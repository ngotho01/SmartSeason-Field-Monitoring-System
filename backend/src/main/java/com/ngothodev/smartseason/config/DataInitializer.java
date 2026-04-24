package com.ngothodev.smartseason.config;

import com.ngothodev.smartseason.model.*;
import com.ngothodev.smartseason.repository.FieldRepository;
import com.ngothodev.smartseason.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FieldRepository fieldRepository;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        User admin = userRepository.save(User.builder()
                .username("admin").password(encoder.encode("admin123"))
                .fullName("System Admin").role(Role.ADMIN).build());

        User a1 = userRepository.save(User.builder()
                .username("agent1").password(encoder.encode("agent123"))
                .fullName("Jane Field").role(Role.AGENT).build());

        User a2 = userRepository.save(User.builder()
                .username("agent2").password(encoder.encode("agent123"))
                .fullName("Peter Kamau").role(Role.AGENT).build());

        fieldRepository.save(Field.builder()
                .name("North Block A").cropType("Maize")
                .plantingDate(LocalDate.now().minusDays(30))
                .currentStage(FieldStage.GROWING)
                .agent(a1)
                .lastUpdateAt(LocalDateTime.now().minusDays(2))
                .build());

        fieldRepository.save(Field.builder()
                .name("South Block B").cropType("Beans")
                .plantingDate(LocalDate.now().minusDays(60))
                .currentStage(FieldStage.READY)
                .agent(a1)
                .lastUpdateAt(LocalDateTime.now().minusDays(10)) // will show AT_RISK
                .build());

        fieldRepository.save(Field.builder()
                .name("East Block C").cropType("Tomatoes")
                .plantingDate(LocalDate.now().minusDays(90))
                .currentStage(FieldStage.HARVESTED)
                .agent(a2)
                .lastUpdateAt(LocalDateTime.now().minusDays(1))
                .build());

        fieldRepository.save(Field.builder()
                .name("West Block D").cropType("Kale")
                .plantingDate(LocalDate.now().minusDays(10))
                .currentStage(FieldStage.PLANTED)
                .agent(a2)
                .build());

        System.out.println("✅ Seed data loaded. admin/admin123 | agent1/agent123 | agent2/agent123");
    }
}