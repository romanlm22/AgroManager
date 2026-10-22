package com.agromanager.livestock;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProductionResponse(
        UUID id,
        UUID farmId,
        LivestockProductType productType,
        LocalDate productionDate,
        BigDecimal quantity,
        ProductionUnit unit,
        UUID herdId,
        String herdName,
        UUID animalId,
        String animalTagNumber,
        BigDecimal pricePerUnit,
        BigDecimal totalIncome,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductionResponse fromEntity(LivestockProduction production) {
        Herd herd = production.getHerd();
        Animal animal = production.getAnimal();

        BigDecimal totalIncome = production.getPricePerUnit() != null
                ? production.getQuantity().multiply(production.getPricePerUnit()).setScale(2, RoundingMode.HALF_UP)
                : null;

        return new ProductionResponse(
                production.getId(),
                production.getFarm().getId(),
                production.getProductType(),
                production.getProductionDate(),
                production.getQuantity(),
                production.getUnit(),
                herd != null ? herd.getId() : null,
                herd != null ? herd.getName() : null,
                animal != null ? animal.getId() : null,
                animal != null ? animal.getTagNumber() : null,
                production.getPricePerUnit(),
                totalIncome,
                production.getNotes(),
                production.getCreatedAt(),
                production.getUpdatedAt()
        );
    }
}
