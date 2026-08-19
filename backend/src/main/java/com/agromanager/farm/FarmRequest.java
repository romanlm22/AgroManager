package com.agromanager.farm;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record FarmRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must be at most 150 characters")
        String name,

        String description,

        String location,

        @DecimalMin(value = "0.0", inclusive = true, message = "Total area must be zero or positive")
        BigDecimal totalAreaHa,

        BigDecimal latitude,

        BigDecimal longitude
) {}