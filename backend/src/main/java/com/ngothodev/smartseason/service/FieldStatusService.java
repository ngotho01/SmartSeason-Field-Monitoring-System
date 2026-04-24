package com.ngothodev.smartseason.service;

import com.ngothodev.smartseason.model.Field;
import com.ngothodev.smartseason.model.FieldStage;
import com.ngothodev.smartseason.model.FieldStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Computes derived FieldStatus from a Field's persisted data.
 *
 * Rules (kept deliberately simple):
 *   - COMPLETED  → currentStage is HARVESTED
 *   - AT_RISK    → no update in the last 7 days (uses lastUpdateAt, falling back to createdAt)
 *   - ACTIVE     → everything else (normal working state)
 *
 * Keeping status as a pure function of the field avoids drift and makes it
 * trivial to unit test.
 */
@Service
public class FieldStatusService {

    private static final int STALE_DAYS = 7;

    public FieldStatus compute(Field field) {
        if (field.getCurrentStage() == FieldStage.HARVESTED) {
            return FieldStatus.COMPLETED;
        }
        LocalDateTime reference = field.getLastUpdateAt() != null
                ? field.getLastUpdateAt()
                : field.getCreatedAt();

        if (reference == null) return FieldStatus.ACTIVE;

        long days = Duration.between(reference, LocalDateTime.now()).toDays();
        return days >= STALE_DAYS ? FieldStatus.AT_RISK : FieldStatus.ACTIVE;
    }
}