package com.agromanager.livestock;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Producción ganadera. Se puede atribuir a un rodeo o a un animal, pero no a los dos.
 */
public record ProductionRequest(

        @NotNull(message = "Product type is required")
        LivestockProductType productType,

        @NotNull(message = "Production date is required")
        @PastOrPresent(message = "Production date cannot be in the future")
        LocalDate productionDate,

        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
        BigDecimal quantity,

        @NotNull(message = "Unit is required")
        ProductionUnit unit,

        UUID herdId,

        UUID animalId,

        @DecimalMin(value = "0.0", message = "Price must be zero or positive")
        BigDecimal pricePerUnit,

        String notes
) {}
