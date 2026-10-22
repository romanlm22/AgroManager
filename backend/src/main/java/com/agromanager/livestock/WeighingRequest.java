package com.agromanager.livestock;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeighingRequest(

        @NotNull(message = "Weighing date is required")
        @PastOrPresent(message = "Weighing date cannot be in the future")
        LocalDate weighingDate,

        @NotNull(message = "Weight is required")
        @DecimalMin(value = "0.1", message = "Weight must be greater than zero")
        BigDecimal weightKg,

        String notes
) {}
