package com.agromanager.livestock;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LivestockSummaryServiceTest {

    private static final LocalDate TODAY = LocalDate.now();

    @Mock
    private HerdRepository herdRepository;

    @Mock
    private AnimalRepository animalRepository;

    @Mock
    private AnimalWeighingRepository weighingRepository;

    @Mock
    private AnimalHealthEventRepository healthEventRepository;

    @Mock
    private LivestockProductionRepository productionRepository;

    @Mock
    private HealthEventService healthEventService;

    @Mock
    private ReproductionService reproductionService;

    @InjectMocks
    private LivestockSummaryService service;

    private final UUID farmId = UUID.randomUUID();

    private Herd herd(String name, LivestockCategory category, int manualHeadCount) {
        return Herd.builder()
                .id(UUID.randomUUID())
                .name(name)
                .category(category)
                .manualHeadCount(manualHeadCount)
                .build();
    }

    private Animal animal(Herd herd, LivestockCategory category, AnimalStatus status) {
        return Animal.builder()
                .id(UUID.randomUUID())
                .tagNumber("T-" + UUID.randomUUID())
                .category(category)
                .status(status)
                .herd(herd)
                .build();
    }

    private AnimalWeighing weighing(Animal animal, int daysAgo, String kg) {
        return AnimalWeighing.builder()
                .animal(animal)
                .weighingDate(TODAY.minusDays(daysAgo))
                .weightKg(new BigDecimal(kg))
                .build();
    }

    private ReproductiveStatusResponse pregnant(int daysToDue) {
        return new ReproductiveStatusResponse(
                UUID.randomUUID(), "P-" + daysToDue, ReproductiveState.PRENADA,
                TODAY.minusDays(283 - daysToDue), TODAY.minusDays(100), null,
                TODAY.plusDays(daysToDue), daysToDue);
    }

    @Test
    void countsHeadFromTagsWhenAHerdHasThemAndFromTheManualCountWhenNot() {
        Herd cows = herd("Vacas", LivestockCategory.VACA, 40);
        Herd calves = herd("Terneros", LivestockCategory.TERNERO, 30);
        when(herdRepository.findAllByFarmIdOrderByNameAsc(farmId)).thenReturn(List.of(calves, cows));
        when(animalRepository.findAllByFarmIdOrderByTagNumberAsc(farmId)).thenReturn(List.of(
                animal(cows, LivestockCategory.VACA, AnimalStatus.ACTIVO),
                animal(cows, LivestockCategory.VACA, AnimalStatus.ACTIVO),
                animal(cows, LivestockCategory.VACA, AnimalStatus.VENDIDO),
                animal(null, LivestockCategory.TORO, AnimalStatus.ACTIVO)));
        stubNoReproduction();
        stubNoHealth();
        stubNoWeighings();
        stubNoProduction();

        LivestockSummaryResponse summary = service.build(farmId);

        // Vacas: 2 fichas activas (el conteo manual de 40 se ignora y la vendida no cuenta),
        // Terneros: sin fichas, 30 manuales, y 1 toro sin rodeo.
        assertThat(summary.totalHeadCount()).isEqualTo(33);
        assertThat(summary.trackedAnimals()).isEqualTo(3);
        assertThat(summary.herdCount()).isEqualTo(2);
        assertThat(summary.headByCategory())
                .extracting(count -> count.category() + ":" + count.headCount())
                .containsExactlyInAnyOrder("TERNERO:30", "VACA:2", "TORO:1");
    }

    @Test
    void reportsPregnantCowsAndOnlyTheBirthsDueWithinThirtyDays() {
        stubNoHerdsNorAnimals();
        stubNoHealth();
        stubNoWeighings();
        stubNoProduction();
        ReproductiveStatusResponse soon = pregnant(10);
        ReproductiveStatusResponse overdue = pregnant(-3);
        ReproductiveStatusResponse far = pregnant(100);
        ReproductiveStatusResponse empty = new ReproductiveStatusResponse(
                UUID.randomUUID(), "V-1", ReproductiveState.VACIA, null, null, null, null, null);
        when(reproductionService.computeStatuses(farmId)).thenReturn(List.of(soon, overdue, far, empty));

        LivestockSummaryResponse summary = service.build(farmId);

        assertThat(summary.pregnantCount()).isEqualTo(3);
        assertThat(summary.dueBirthsTotal()).isEqualTo(2);
        assertThat(summary.dueBirths())
                .extracting(LivestockSummaryResponse.DueBirth::daysToDue)
                .containsExactly(-3, 10);
    }

    @Test
    void averagesTheDailyGainOfTheLastTwoWeighingsOfEachAnimal() {
        Animal a1 = animal(null, LivestockCategory.NOVILLO, AnimalStatus.ACTIVO);
        Animal a2 = animal(null, LivestockCategory.NOVILLO, AnimalStatus.ACTIVO);
        Animal a3 = animal(null, LivestockCategory.NOVILLO, AnimalStatus.ACTIVO);
        when(herdRepository.findAllByFarmIdOrderByNameAsc(farmId)).thenReturn(List.of());
        when(animalRepository.findAllByFarmIdOrderByTagNumberAsc(farmId)).thenReturn(List.of(a1, a2, a3));
        stubNoReproduction();
        stubNoHealth();
        stubNoProduction();
        when(weighingRepository.findAllByAnimal_Farm_IdAndAnimal_StatusOrderByWeighingDateAscCreatedAtAsc(
                farmId, AnimalStatus.ACTIVO)).thenReturn(List.of(
                weighing(a1, 30, "150.0"),   // se ignora: no es de los dos últimos
                weighing(a1, 10, "200.0"),
                weighing(a1, 0, "210.0"),    // 1,00 kg/día
                weighing(a2, 10, "300.0"),
                weighing(a2, 0, "320.0"),    // 2,00 kg/día
                weighing(a3, 0, "250.0")));  // un solo pesaje: no cuenta

        LivestockSummaryResponse summary = service.build(farmId);

        assertThat(summary.animalsWithGain()).isEqualTo(2);
        assertThat(summary.averageDailyGainKg()).isEqualByComparingTo("1.50");
    }

    @Test
    void withoutAnyWeighingTheAverageGainIsNull() {
        stubNoHerdsNorAnimals();
        stubNoReproduction();
        stubNoHealth();
        stubNoWeighings();
        stubNoProduction();

        LivestockSummaryResponse summary = service.build(farmId);

        assertThat(summary.averageDailyGainKg()).isNull();
        assertThat(summary.animalsWithGain()).isZero();
    }

    @Test
    void sumsTheIncomeOfTheCurrentMonthAndKeepsSixMonthsOfHistory() {
        stubNoHerdsNorAnimals();
        stubNoReproduction();
        stubNoWeighings();
        when(healthEventService.findDueDoses(eq(farmId), anyInt())).thenReturn(List.of());
        when(healthEventRepository.sumCostByFarmId(farmId)).thenReturn(new BigDecimal("1500.5"));

        LivestockProduction milk = LivestockProduction.builder()
                .productType(LivestockProductType.LECHE)
                .productionDate(TODAY)
                .quantity(new BigDecimal("100"))
                .unit(ProductionUnit.LITROS)
                .pricePerUnit(new BigDecimal("50"))
                .build();
        LivestockProduction milkWithoutPrice = LivestockProduction.builder()
                .productType(LivestockProductType.LECHE)
                .productionDate(TODAY)
                .quantity(new BigDecimal("20"))
                .unit(ProductionUnit.LITROS)
                .build();
        when(productionRepository
                .findAllByFarmIdAndProductionDateBetweenOrderByProductionDateDescCreatedAtDesc(
                        eq(farmId), any(), any())).thenReturn(List.of(milk, milkWithoutPrice));

        LivestockSummaryResponse summary = service.build(farmId);

        assertThat(summary.totalHealthCost()).isEqualByComparingTo("1500.50");
        assertThat(summary.currentMonthIncome()).isEqualByComparingTo("5000.00");
        assertThat(summary.currentMonthProduction()).hasSize(1);
        assertThat(summary.currentMonthProduction().get(0).quantity()).isEqualByComparingTo("120");

        assertThat(summary.monthlyIncome()).hasSize(6);
        LivestockSummaryResponse.MonthlyIncome last = summary.monthlyIncome().get(5);
        assertThat(last.month()).isEqualTo(YearMonth.from(TODAY).toString());
        assertThat(last.income()).isEqualByComparingTo("5000.00");
        assertThat(summary.monthlyIncome().get(0).income()).isEqualByComparingTo("0");
    }

    // Respuestas vacías para lo que cada test no está probando.

    private void stubNoHerdsNorAnimals() {
        when(herdRepository.findAllByFarmIdOrderByNameAsc(farmId)).thenReturn(List.of());
        when(animalRepository.findAllByFarmIdOrderByTagNumberAsc(farmId)).thenReturn(List.of());
    }

    private void stubNoReproduction() {
        when(reproductionService.computeStatuses(farmId)).thenReturn(List.of());
    }

    private void stubNoHealth() {
        when(healthEventService.findDueDoses(eq(farmId), anyInt())).thenReturn(List.of());
        when(healthEventRepository.sumCostByFarmId(farmId)).thenReturn(BigDecimal.ZERO);
    }

    private void stubNoWeighings() {
        when(weighingRepository.findAllByAnimal_Farm_IdAndAnimal_StatusOrderByWeighingDateAscCreatedAtAsc(
                farmId, AnimalStatus.ACTIVO)).thenReturn(List.of());
    }

    private void stubNoProduction() {
        when(productionRepository
                .findAllByFarmIdAndProductionDateBetweenOrderByProductionDateDescCreatedAtDesc(
                        eq(farmId), any(), any())).thenReturn(List.of());
    }
}
