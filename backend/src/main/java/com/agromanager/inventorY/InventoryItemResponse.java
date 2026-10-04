package com.agromanager.inventory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InventoryItemResponse(
        UUID id,
        UUID farmId,
        String name,
        InventoryCategory category,
        String supplier,
        BigDecimal stock,
        InventoryUnit unit,
        BigDecimal price,
        LocalDate expirationDate,
        String batchNumber,
        Instant createdAt,
        Instant updatedAt
) {
    public static InventoryItemResponse fromEntity(InventoryItem item) {
        return new InventoryItemResponse(
                item.getId(),
                item.getFarm().getId(),
                item.getName(),
                item.getCategory(),
                item.getSupplier(),
                item.getStock(),
                item.getUnit(),
                item.getPrice(),
                item.getExpirationDate(),
                item.getBatchNumber(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
