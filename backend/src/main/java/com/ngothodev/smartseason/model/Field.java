package com.ngothodev.smartseason.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fields")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Field {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String cropType;

    @Column(nullable = false)
    private LocalDate plantingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldStage currentStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastUpdateAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.currentStage == null) this.currentStage = FieldStage.PLANTED;
    }
}