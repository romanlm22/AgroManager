package com.agromanager.livestock;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record AnimalRequest(

        @NotBlank(message = "Tag number is required")
        @Size(max = 50, message = "Tag number must be at most 50 characters")
        String tagNumber,

        @NotNull(message = "Sex is required")
        AnimalSex sex,

        @Size(max = 100, message = "Breed must be at most 100 characters")
        String breed,

        @PastOrPresent(message = "Birth date cannot be in the future")
        LocalDate birthDate,

        @NotNull(message = "Category is required")
        LivestockCategory category,

        AnimalStatus status,

        @DecimalMin(value = "0.0", message = "Weight must be zero or positive")
        BigDecimal currentWeightKg,

        UUID herdId,

        UUID fieldId,

        String notes
) {}
