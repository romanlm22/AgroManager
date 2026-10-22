package com.agromanager.livestock;

import java.time.Instant;
import java.util.UUID;

public record HerdResponse(
        UUID id,
        UUID farmId,
        String name,
        LivestockCategory category,
        UUID fieldId,
        String fieldName,
        int manualHeadCount,
        long trackedAnimals,
        long headCount,
        HeadCountMode headCountMode,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    /**
     * Si el rodeo tiene fichas individuales activas, la cantidad de cabezas sale de
     * ellas; si no, se usa el conteo manual.
     */
    public static HerdResponse fromEntity(Herd herd, long trackedAnimals) {
        boolean fromTags = trackedAnimals > 0;

        return new HerdResponse(
                herd.getId(),
                herd.getFarm().getId(),
                herd.getName(),
                herd.getCategory(),
                herd.getField() != null ? herd.getField().getId() : null,
                herd.getField() != null ? herd.getField().getName() : null,
                herd.getManualHeadCount(),
                trackedAnimals,
                fromTags ? trackedAnimals : herd.getManualHeadCount(),
                fromTags ? HeadCountMode.FICHAS : HeadCountMode.MANUAL,
                herd.getNotes(),
                herd.getCreatedAt(),
                herd.getUpdatedAt()
        );
    }
}
