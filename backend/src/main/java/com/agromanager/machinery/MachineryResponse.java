package com.agromanager.machinery;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record MachineryResponse(
        UUID id,
        UUID farmId,
        String name,
        MachineryType machineryType,
        String brand,
        String model,
        Integer year,
        BigDecimal hoursUsed,
        MachineryStatus status,
        LocalDate nextMaintenanceDate,
        Instant createdAt,
        Instant updatedAt
) {
    public static MachineryResponse fromEntity(Machinery machinery) {
        return new MachineryResponse(
                machinery.getId(),
                machinery.getFarm().getId(),
                machinery.getName(),
                machinery.getMachineryType(),
                machinery.getBrand(),
                machinery.getModel(),
                machinery.getYear(),
                machinery.getHoursUsed(),
                machinery.getStatus(),
                machinery.getNextMaintenanceDate(),
                machinery.getCreatedAt(),
                machinery.getUpdatedAt()
        );
    }
}
