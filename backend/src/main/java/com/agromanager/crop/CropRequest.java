package com.agromanager.crop;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CropRequest(

        @NotNull(message = "Crop type is required")
        UUID cropTypeId,

        @NotNull(message = "Planting date is required")
        LocalDate plantingDate,

        LocalDate estimatedHarvestDate,

        LocalDate actualHarvestDate,

        @DecimalMin(value = "0.0", inclusive = true, message = "Planted area must be zero or positive")
        BigDecimal plantedAreaHa,

        @DecimalMin(value = "0.0", inclusive = true, message = "Yield must be zero or positive")
        BigDecimal yieldKgHa,

        CropStatus status
) {}