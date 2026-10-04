package com.agromanager.machinery;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceResponse(
        UUID id,
        UUID machineryId,
        LocalDate maintenanceDate,
        String description,
        BigDecimal cost,
        Instant createdAt,
        Instant updatedAt
) {
    public static MaintenanceResponse fromEntity(MachineryMaintenance maintenance) {
        return new MaintenanceResponse(
                maintenance.getId(),
                maintenance.getMachinery().getId(),
                maintenance.getMaintenanceDate(),
                maintenance.getDescription(),
                maintenance.getCost(),
                maintenance.getCreatedAt(),
                maintenance.getUpdatedAt()
        );
    }
}
