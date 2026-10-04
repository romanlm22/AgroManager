package com.agromanager.machinery;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MaintenanceRequest(

        @NotNull(message = "Maintenance date is required")
        LocalDate maintenanceDate,

        String description,

        @DecimalMin(value = "0.0", inclusive = true, message = "Cost must be zero or positive")
        BigDecimal cost
) {}
