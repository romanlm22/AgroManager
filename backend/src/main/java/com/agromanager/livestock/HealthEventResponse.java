package com.agromanager.livestock;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * nextDosePending es true cuando este evento tiene próxima dosis y es el más
 * reciente para ese mismo destino (animal o rodeo) y producto: si ya se aplicó una
 * dosis posterior, la próxima dosis de los eventos viejos deja de estar pendiente.
 */
public record HealthEventResponse(
        UUID id,
        UUID farmId,
        UUID animalId,
        String animalTagNumber,
        UUID herdId,
        String herdName,
        HealthEventType eventType,
        LocalDate eventDate,
        String product,
        String dose,
        LocalDate nextDoseDate,
        boolean nextDosePending,
        BigDecimal cost,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static HealthEventResponse fromEntity(AnimalHealthEvent event, boolean nextDosePending) {
        Animal animal = event.getAnimal();
        Herd herd = event.getHerd();

        return new HealthEventResponse(
                event.getId(),
                event.getFarm().getId(),
                animal != null ? animal.getId() : null,
                animal != null ? animal.getTagNumber() : null,
                herd != null ? herd.getId() : null,
                herd != null ? herd.getName() : null,
                event.getEventType(),
                event.getEventDate(),
                event.getProduct(),
                event.getDose(),
                event.getNextDoseDate(),
                nextDosePending,
                event.getCost(),
                event.getNotes(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
