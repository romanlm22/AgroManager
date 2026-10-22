package com.agromanager.livestock;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Un pesaje con su ganancia diaria de peso (GDP) respecto del pesaje anterior.
 * La GDP es null en el primer pesaje o si ambos son del mismo día.
 */
public record WeighingResponse(
        UUID id,
        UUID animalId,
        LocalDate weighingDate,
        BigDecimal weightKg,
        Integer daysSincePrevious,
        BigDecimal dailyGainKg,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static WeighingResponse fromEntity(AnimalWeighing weighing, AnimalWeighing previous) {
        Integer days = null;
        BigDecimal gain = null;

        if (previous != null) {
            long between = ChronoUnit.DAYS.between(previous.getWeighingDate(), weighing.getWeighingDate());
            if (between > 0) {
                days = (int) between;
                gain = weighing.getWeightKg()
                        .subtract(previous.getWeightKg())
                        .divide(BigDecimal.valueOf(between), 2, RoundingMode.HALF_UP);
            }
        }

        return new WeighingResponse(
                weighing.getId(),
                weighing.getAnimal().getId(),
                weighing.getWeighingDate(),
                weighing.getWeightKg(),
                days,
                gain,
                weighing.getNotes(),
                weighing.getCreatedAt(),
                weighing.getUpdatedAt()
        );
    }
}
