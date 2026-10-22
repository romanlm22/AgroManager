package com.agromanager.livestock;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Baja de un animal. status debe ser VENDIDO o MUERTO. El peso final y el precio por
 * kg solo aplican a ventas y generan una producción de CARNE.
 */
public record RetireRequest(

        @NotNull(message = "Status is required")
        AnimalStatus status,

        @PastOrPresent(message = "Retirement date cannot be in the future")
        LocalDate retireDate,

        @DecimalMin(value = "0.1", message = "Final weight must be greater than zero")
        BigDecimal finalWeightKg,

        @DecimalMin(value = "0.0", message = "Price must be zero or positive")
        BigDecimal pricePerKg
) {}
