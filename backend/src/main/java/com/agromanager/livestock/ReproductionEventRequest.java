package com.agromanager.livestock;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Evento reproductivo de una hembra. Cada dato aplica solo a su tipo de evento:
 * serviceType y sire* a SERVICIO, tactoResult a TACTO y calf a PARTO (solo al crear).
 */
public record ReproductionEventRequest(

        @NotNull(message = "Animal is required")
        UUID animalId,

        @NotNull(message = "Event type is required")
        ReproductionEventType eventType,

        @NotNull(message = "Event date is required")
        @PastOrPresent(message = "Event date cannot be in the future")
        LocalDate eventDate,

        ServiceType serviceType,

        UUID sireAnimalId,

        @Size(max = 150, message = "Sire description must be at most 150 characters")
        String sireDescription,

        TactoResult tactoResult,

        @Valid
        CalfRequest calf,

        String notes
) {

    /** Cría nacida en un parto: se crea su ficha con la madre vinculada. */
    public record CalfRequest(

            @NotBlank(message = "Calf tag number is required")
            @Size(max = 50, message = "Tag number must be at most 50 characters")
            String tagNumber,

            @NotNull(message = "Calf sex is required")
            AnimalSex sex,

            @DecimalMin(value = "0.1", message = "Birth weight must be greater than zero")
            BigDecimal birthWeightKg
    ) {}
}
