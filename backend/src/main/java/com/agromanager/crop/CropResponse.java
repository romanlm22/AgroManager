package com.agromanager.crop;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CropResponse(
        UUID id,
        UUID fieldId,
        UUID cropTypeId,
        String cropTypeName,
        LocalDate plantingDate,
        LocalDate estimatedHarvestDate,
        LocalDate actualHarvestDate,
        BigDecimal plantedAreaHa,
        BigDecimal yieldKgHa,
        CropStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static CropResponse fromEntity(Crop crop) {
        return new CropResponse(
                crop.getId(),
                crop.getField().getId(),
                crop.getCropType().getId(),
                crop.getCropType().getName(),
                crop.getPlantingDate(),
                crop.getEstimatedHarvestDate(),
                crop.getActualHarvestDate(),
                crop.getPlantedAreaHa(),
                crop.getYieldKgHa(),
                crop.getStatus(),
                crop.getCreatedAt(),
                crop.getUpdatedAt()
        );
    }
}