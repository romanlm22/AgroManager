package com.agromanager.livestock;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Evento sanitario. Hay que indicar exactamente uno de animalId o herdId.
 */
public record HealthEventRequest(

        UUID animalId,

        UUID herdId,

        @NotNull(message = "Event type is required")
        HealthEventType eventType,

        @NotNull(message = "Event date is required")
        @PastOrPresent(message = "Event date cannot be in the future")
        LocalDate eventDate,

        @NotBlank(message = "Product is required")
        @Size(max = 150, message = "Product must be at most 150 characters")
        String product,

        @Size(max = 100, message = "Dose must be at most 100 characters")
        String dose,

        LocalDate nextDoseDate,

        @DecimalMin(value = "0.0", message = "Cost must be zero or positive")
        BigDecimal cost,

        String notes
) {}
