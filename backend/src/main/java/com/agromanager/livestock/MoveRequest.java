package com.agromanager.livestock;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;
import java.util.UUID;

public record MoveRequest(

        @NotNull(message = "Destination field is required")
        UUID toFieldId,

        @PastOrPresent(message = "Movement date cannot be in the future")
        LocalDate movementDate,

        String notes
) {}
