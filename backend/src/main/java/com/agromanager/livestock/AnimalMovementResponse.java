package com.agromanager.livestock;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AnimalMovementResponse(
        UUID id,
        UUID animalId,
        UUID fromFieldId,
        String fromFieldName,
        UUID toFieldId,
        String toFieldName,
        LocalDate movementDate,
        String notes,
        Instant createdAt
) {
    public static AnimalMovementResponse fromEntity(AnimalMovement movement) {
        return new AnimalMovementResponse(
                movement.getId(),
                movement.getAnimal().getId(),
                movement.getFromField() != null ? movement.getFromField().getId() : null,
                movement.getFromField() != null ? movement.getFromField().getName() : null,
                movement.getToField() != null ? movement.getToField().getId() : null,
                movement.getToField() != null ? movement.getToField().getName() : null,
                movement.getMovementDate(),
                movement.getNotes(),
                movement.getCreatedAt()
        );
    }
}
