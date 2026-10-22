package com.agromanager.livestock;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Alta masiva: una lista de caravanas que comparten el resto de los datos.
 */
public record BulkAnimalRequest(

        @NotEmpty(message = "At least one tag number is required")
        @Size(max = 500, message = "At most 500 animals per request")
        List<@NotBlank(message = "Tag number cannot be blank")
        @Size(max = 50, message = "Tag number must be at most 50 characters") String> tagNumbers,

        @NotNull(message = "Sex is required")
        AnimalSex sex,

        @Size(max = 100, message = "Breed must be at most 100 characters")
        String breed,

        @PastOrPresent(message = "Birth date cannot be in the future")
        LocalDate birthDate,

        @NotNull(message = "Category is required")
        LivestockCategory category,

        UUID herdId,

        UUID fieldId,

        String notes
) {}
