package com.agromanager.field;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FieldResponse(
        UUID id,
        UUID farmId,
        String name,
        BigDecimal areaHa,
        String soilType,
        BigDecimal latitude,
        BigDecimal longitude,
        FieldStatus status,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static FieldResponse fromEntity(Field field) {
        return new FieldResponse(
                field.getId(),
                field.getFarm().getId(),
                field.getName(),
                field.getAreaHa(),
                field.getSoilType(),
                field.getLatitude(),
                field.getLongitude(),
                field.getStatus(),
                field.getNotes(),
                field.getCreatedAt(),
                field.getUpdatedAt()
        );
    }
}