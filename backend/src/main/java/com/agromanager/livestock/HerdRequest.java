package com.agromanager.livestock;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record HerdRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must be at most 150 characters")
        String name,

        @NotNull(message = "Category is required")
        LivestockCategory category,

        UUID fieldId,

        @Min(value = 0, message = "Head count must be zero or positive")
        Integer manualHeadCount,

        String notes
) {}
