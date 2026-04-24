package com.ngothodev.smartseason.repository;

import com.ngothodev.smartseason.model.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, Long> {
    List<Field> findByAgentId(Long agentId);
}