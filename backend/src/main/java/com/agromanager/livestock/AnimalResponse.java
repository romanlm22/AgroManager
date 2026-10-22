package com.agromanager.livestock;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AnimalResponse(
        UUID id,
        UUID farmId,
        String tagNumber,
        AnimalSex sex,
        String breed,
        LocalDate birthDate,
        LivestockCategory category,
        AnimalStatus status,
        BigDecimal currentWeightKg,
        UUID herdId,
        String herdName,
        UUID fieldId,
        String fieldName,
        UUID motherId,
        String motherTagNumber,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static AnimalResponse fromEntity(Animal animal) {
        return new AnimalResponse(
                animal.getId(),
                animal.getFarm().getId(),
                animal.getTagNumber(),
                animal.getSex(),
                animal.getBreed(),
                animal.getBirthDate(),
                animal.getCategory(),
                animal.getStatus(),
                animal.getCurrentWeightKg(),
                animal.getHerd() != null ? animal.getHerd().getId() : null,
                animal.getHerd() != null ? animal.getHerd().getName() : null,
                animal.getField() != null ? animal.getField().getId() : null,
                animal.getField() != null ? animal.getField().getName() : null,
                animal.getMother() != null ? animal.getMother().getId() : null,
                animal.getMother() != null ? animal.getMother().getTagNumber() : null,
                animal.getNotes(),
                animal.getCreatedAt(),
                animal.getUpdatedAt()
        );
    }
}
