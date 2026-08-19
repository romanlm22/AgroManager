package com.agromanager.field;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record FieldRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must be at most 150 characters")
        String name,

        @DecimalMin(value = "0.0", inclusive = true, message = "Area must be zero or positive")
        BigDecimal areaHa,

        String soilType,

        BigDecimal latitude,

        BigDecimal longitude,

        FieldStatus status,

        String notes
) {}