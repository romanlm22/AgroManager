package com.agromanager.farm;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FarmResponse(
        UUID id,
        String name,
        String description,
        String location,
        BigDecimal totalAreaHa,
        BigDecimal latitude,
        BigDecimal longitude,
        FarmRole myRole,
        Instant createdAt,
        Instant updatedAt
) {
    public static FarmResponse fromEntity(Farm farm, FarmRole myRole) {
        return new FarmResponse(
                farm.getId(),
                farm.getName(),
                farm.getDescription(),
                farm.getLocation(),
                farm.getTotalAreaHa(),
                farm.getLatitude(),
                farm.getLongitude(),
                myRole,
                farm.getCreatedAt(),
                farm.getUpdatedAt()
        );
    }
}