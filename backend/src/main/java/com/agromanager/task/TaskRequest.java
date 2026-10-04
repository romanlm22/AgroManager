package com.agromanager.task;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TaskRequest(

        UUID cropId,

        @NotNull(message = "Task type is required")
        TaskType taskType,

        TaskStatus status,

        @NotNull(message = "Task date is required")
        LocalDate taskDate,

        @DecimalMin(value = "0.0", inclusive = true, message = "Cost must be zero or positive")
        BigDecimal cost,

        String notes
) {}
