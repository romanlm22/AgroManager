package com.agromanager.task;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID fieldId,
        UUID cropId,
        UUID responsibleId,
        String responsibleEmail,
        TaskType taskType,
        TaskStatus status,
        LocalDate taskDate,
        BigDecimal cost,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static TaskResponse fromEntity(AgriculturalTask task) {
        return new TaskResponse(
                task.getId(),
                task.getField().getId(),
                task.getCrop() != null ? task.getCrop().getId() : null,
                task.getResponsible().getId(),
                task.getResponsible().getEmail(),
                task.getTaskType(),
                task.getStatus(),
                task.getTaskDate(),
                task.getCost(),
                task.getNotes(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
