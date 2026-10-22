package com.agromanager.livestock;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

/**
 * Arma el resumen ganadero de un establecimiento. No verifica acceso: quien lo llama
 * (dashboard, reportes, asistente) ya tiene que haber autorizado al usuario.
 */
@Service
@RequiredArgsConstructor
public class LivestockSummaryService {

    private static final int DUE_DOSE_WINDOW_DAYS = 7;
    private static final int DUE_BIRTH_WINDOW_DAYS = 30;
    private static final int LIST_LIMIT = 10;
    private static final int INCOME_MONTHS = 6;

    private final HerdRepository herdRepository;
    private final AnimalRepository animalRepository;
    private final AnimalWeighingRepository weighingRepository;
    private final AnimalHealthEventRepository healthEventRepository;
    private final LivestockProductionRepository productionRepository;
    private final HealthEventService healthEventService;
    private final ReproductionService reproductionService;

    private record Gain(BigDecimal average, long animals) {}

    private record ProductionSummary(
            List<LivestockSummaryResponse.ProductionTotal> currentMonthProduction,
            BigDecimal currentMonthIncome,
            List<LivestockSummaryResponse.MonthlyIncome> monthlyIncome
    ) {}

    private record TotalKey(LivestockProductType type, ProductionUnit unit) {}

    @Transactional(readOnly = true)
    public LivestockSummaryResponse build(UUID farmId) {
        LocalDate today = LocalDate.now();

        List<Herd> herds = herdRepository.findAllByFarmIdOrderByNameAsc(farmId);
        List<Animal> activeAnimals = animalRepository.findAllByFarmIdOrderByTagNumberAsc(farmId).stream()
                .filter(animal -> animal.getStatus() == AnimalStatus.ACTIVO)
                .toList();

        Map<LivestockCategory, Long> byCategory = headByCategory(herds, activeAnimals);
        long totalHeadCount = byCategory.values().stream().mapToLong(Long::longValue).sum();
        List<LivestockSummaryResponse.CategoryCount> headByCategory = byCategory.entrySet().stream()
                .map(entry -> new LivestockSummaryResponse.CategoryCount(entry.getKey(), entry.getValue()))
                .toList();

        List<ReproductiveStatusResponse> pregnant = reproductionService.computeStatuses(farmId).stream()
                .filter(status -> status.state() == ReproductiveState.PRENADA)
                .toList();
        List<LivestockSummaryResponse.DueBirth> dueBirths = pregnant.stream()
                .filter(status -> status.daysToDue() != null && status.daysToDue() <= DUE_BIRTH_WINDOW_DAYS)
                .sorted(Comparator.comparing(ReproductiveStatusResponse::estimatedDueDate))
                .map(status -> new LivestockSummaryResponse.DueBirth(
                        status.animalId(),
                        status.animalTagNumber(),
                        status.estimatedDueDate(),
                        status.daysToDue()))
                .toList();

        List<LivestockSummaryResponse.DueDose> dueDoses =
                healthEventService.findDueDoses(farmId, DUE_DOSE_WINDOW_DAYS).stream()
                        .map(event -> new LivestockSummaryResponse.DueDose(
                                event.id(),
                                event.animalId() != null ? event.animalTagNumber() : event.herdName(),
                                event.animalId() == null,
                                event.product(),
                                event.nextDoseDate(),
                                event.nextDoseDate().isBefore(today)))
                        .toList();

        Gain gain = averageDailyGain(farmId);
        ProductionSummary production = productionSummary(farmId, today);

        return new LivestockSummaryResponse(
                totalHeadCount,
                activeAnimals.size(),
                herds.size(),
                headByCategory,
                pregnant.size(),
                dueBirths.size(),
                dueBirths.stream().limit(LIST_LIMIT).toList(),
                dueDoses.size(),
                dueDoses.stream().limit(LIST_LIMIT).toList(),
                gain.average(),
                gain.animals(),
                healthEventRepository.sumCostByFarmId(farmId).setScale(2, RoundingMode.HALF_UP),
                production.currentMonthProduction(),
                production.currentMonthIncome(),
                production.monthlyIncome()
        );
    }

    /** Rodeos con fichas activas cuentan por ficha; los que no tienen, por su conteo manual. */
    private Map<LivestockCategory, Long> headByCategory(List<Herd> herds, List<Animal> activeAnimals) {
        Map<UUID, Long> trackedByHerd = new LinkedHashMap<>();
        Map<LivestockCategory, Long> byCategory = new EnumMap<>(LivestockCategory.class);

        for (Animal animal : activeAnimals) {
            byCategory.merge(animal.getCategory(), 1L, Long::sum);
            if (animal.getHerd() != null) {
                trackedByHerd.merge(animal.getHerd().getId(), 1L, Long::sum);
            }
        }

        for (Herd herd : herds) {
            boolean hasTags = trackedByHerd.getOrDefault(herd.getId(), 0L) > 0;
            if (!hasTags && herd.getManualHeadCount() > 0) {
                byCategory.merge(herd.getCategory(), (long) herd.getManualHeadCount(), Long::sum);
            }
        }

        return byCategory;
    }

    /**
     * GDP promedio de los animales activos con al menos dos pesajes, usando los dos
     * últimos de cada uno.
     */
    private Gain averageDailyGain(UUID farmId) {
        Map<UUID, List<AnimalWeighing>> byAnimal = new LinkedHashMap<>();
        for (AnimalWeighing weighing : weighingRepository
                .findAllByAnimal_Farm_IdAndAnimal_StatusOrderByWeighingDateAscCreatedAtAsc(
                        farmId, AnimalStatus.ACTIVO)) {
            byAnimal.computeIfAbsent(weighing.getAnimal().getId(), id -> new ArrayList<>()).add(weighing);
        }

        BigDecimal sum = BigDecimal.ZERO;
        long count = 0;

        for (List<AnimalWeighing> weighings : byAnimal.values()) {
            if (weighings.size() < 2) {
                continue;
            }
            AnimalWeighing last = weighings.get(weighings.size() - 1);
            AnimalWeighing previous = weighings.get(weighings.size() - 2);
            long days = ChronoUnit.DAYS.between(previous.getWeighingDate(), last.getWeighingDate());
            if (days <= 0) {
                continue;
            }
            sum = sum.add(last.getWeightKg().subtract(previous.getWeightKg())
                    .divide(BigDecimal.valueOf(days), 4, RoundingMode.HALF_UP));
            count++;
        }

        if (count == 0) {
            return new Gain(null, 0);
        }

        return new Gain(sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP), count);
    }

    /** Totales del mes en curso por producto y unidad, e ingresos de los últimos meses. */
    private ProductionSummary productionSummary(UUID farmId, LocalDate today) {
        YearMonth currentMonth = YearMonth.from(today);
        LocalDate rangeStart = currentMonth.minusMonths(INCOME_MONTHS - 1L).atDay(1);

        List<LivestockProduction> productions = productionRepository
                .findAllByFarmIdAndProductionDateBetweenOrderByProductionDateDescCreatedAtDesc(
                        farmId, rangeStart, currentMonth.atEndOfMonth());

        Map<YearMonth, BigDecimal> incomeByMonth = new TreeMap<>();
        for (int i = INCOME_MONTHS - 1; i >= 0; i--) {
            incomeByMonth.put(currentMonth.minusMonths(i), BigDecimal.ZERO);
        }

        Map<TotalKey, BigDecimal[]> currentTotals = new LinkedHashMap<>();
        BigDecimal currentMonthIncome = BigDecimal.ZERO;

        for (LivestockProduction production : productions) {
            BigDecimal income = production.getPricePerUnit() != null
                    ? production.getQuantity().multiply(production.getPricePerUnit())
                    : BigDecimal.ZERO;
            YearMonth month = YearMonth.from(production.getProductionDate());
            incomeByMonth.merge(month, income, BigDecimal::add);

            if (month.equals(currentMonth)) {
                currentMonthIncome = currentMonthIncome.add(income);
                BigDecimal[] total = currentTotals.computeIfAbsent(
                        new TotalKey(production.getProductType(), production.getUnit()),
                        key -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
                total[0] = total[0].add(production.getQuantity());
                total[1] = total[1].add(income);
            }
        }

        List<LivestockSummaryResponse.ProductionTotal> currentMonthProduction = currentTotals.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<TotalKey, BigDecimal[]> entry) -> entry.getKey().type())
                        .thenComparing(entry -> entry.getKey().unit()))
                .map(entry -> new LivestockSummaryResponse.ProductionTotal(
                        entry.getKey().type(),
                        entry.getKey().unit(),
                        entry.getValue()[0],
                        entry.getValue()[1].setScale(2, RoundingMode.HALF_UP)))
                .toList();

        List<LivestockSummaryResponse.MonthlyIncome> monthlyIncome = incomeByMonth.entrySet().stream()
                .map(entry -> new LivestockSummaryResponse.MonthlyIncome(
                        entry.getKey().toString(),
                        entry.getValue().setScale(2, RoundingMode.HALF_UP)))
                .toList();

        return new ProductionSummary(
                currentMonthProduction,
                currentMonthIncome.setScale(2, RoundingMode.HALF_UP),
                monthlyIncome);
    }
}
