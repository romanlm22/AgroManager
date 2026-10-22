package com.agromanager.livestock;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Resumen ganadero del establecimiento, calculado en vivo. Lo usan el dashboard, los
 * reportes y el asistente de IA, así todos muestran las mismas cifras.
 *
 * Las cabezas salen de las fichas individuales activas de cada rodeo y, si un rodeo no
 * tiene fichas, de su conteo manual. dueBirths y dueDoses vienen acotadas; los totales
 * indican cuántas había en realidad.
 */
public record LivestockSummaryResponse(
        long totalHeadCount,
        long trackedAnimals,
        long herdCount,
        List<CategoryCount> headByCategory,
        long pregnantCount,
        long dueBirthsTotal,
        List<DueBirth> dueBirths,
        long dueDosesTotal,
        List<DueDose> dueDoses,
        BigDecimal averageDailyGainKg,
        long animalsWithGain,
        BigDecimal totalHealthCost,
        List<ProductionTotal> currentMonthProduction,
        BigDecimal currentMonthIncome,
        List<MonthlyIncome> monthlyIncome
) {

    public record CategoryCount(LivestockCategory category, long headCount) {}

    /** daysToDue es negativo si la fecha estimada de parto ya pasó. */
    public record DueBirth(UUID animalId, String tagNumber, LocalDate estimatedDueDate, int daysToDue) {}

    public record DueDose(
            UUID eventId,
            String targetName,
            boolean herdTarget,
            String product,
            LocalDate nextDoseDate,
            boolean overdue
    ) {}

    public record ProductionTotal(
            LivestockProductType productType,
            ProductionUnit unit,
            BigDecimal quantity,
            BigDecimal income
    ) {}

    /** month en formato AAAA-MM. */
    public record MonthlyIncome(String month, BigDecimal income) {}
}
