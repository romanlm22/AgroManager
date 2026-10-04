package com.agromanager.machinery;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MachineryRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must be at most 150 characters")
        String name,

        @NotNull(message = "Machinery type is required")
        MachineryType machineryType,

        @Size(max = 100, message = "Brand must be at most 100 characters")
        String brand,

        @Size(max = 100, message = "Model must be at most 100 characters")
        String model,

        @Min(value = 1900, message = "Year must be a valid year")
        Integer year,

        BigDecimal hoursUsed,

        MachineryStatus status,

        LocalDate nextMaintenanceDate
) {}
