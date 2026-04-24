package com.ngothodev.smartseason.repository;

import com.ngothodev.smartseason.model.FieldUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldUpdateRepository extends JpaRepository<FieldUpdate, Long> {
    List<FieldUpdate> findByFieldIdOrderByCreatedAtDesc(Long fieldId);
    List<FieldUpdate> findTop10ByAgentIdOrderByCreatedAtDesc(Long agentId);
    List<FieldUpdate> findTop20ByOrderByCreatedAtDesc();
}