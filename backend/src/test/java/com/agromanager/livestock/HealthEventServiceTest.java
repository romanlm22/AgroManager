package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/** Próximas dosis pendientes: solo cuenta el último evento por destino y producto. */
@ExtendWith(MockitoExtension.class)
class HealthEventServiceTest {

    private static final LocalDate TODAY = LocalDate.now();

    @Mock
    private AnimalHealthEventRepository eventRepository;

    @Mock
    private LivestockAccess access;

    @InjectMocks
    private HealthEventService service;

    private final UUID farmId = UUID.randomUUID();
    private final Farm farm = Farm.builder().id(farmId).build();

    private Animal animal(AnimalStatus status) {
        return Animal.builder().id(UUID.randomUUID()).tagNumber("T-" + UUID.randomUUID()).status(status).build();
    }

    private Herd herd(String name) {
        return Herd.builder().id(UUID.randomUUID()).name(name).build();
    }

    private AnimalHealthEvent event(Animal animal, Herd herd, String product,
                                    LocalDate eventDate, LocalDate nextDose) {
        return AnimalHealthEvent.builder()
                .id(UUID.randomUUID())
                .farm(farm)
                .animal(animal)
                .herd(herd)
                .eventType(HealthEventType.VACUNACION)
                .eventDate(eventDate)
                .product(product)
                .nextDoseDate(nextDose)
                .createdAt(Instant.now())
                .build();
    }

    @Test
    void includesOverdueAndSoonDosesOrderedByDate() {
        Animal cow = animal(AnimalStatus.ACTIVO);
        Herd calves = herd("Terneros");
        AnimalHealthEvent soon = event(cow, null, "Aftosa", TODAY.minusDays(20), TODAY.plusDays(3));
        AnimalHealthEvent overdue = event(null, calves, "Brucelosis", TODAY.minusDays(40), TODAY.minusDays(2));
        when(eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId))
                .thenReturn(List.of(soon, overdue));

        List<HealthEventResponse> due = service.findDueDoses(farmId, 7);

        assertThat(due).extracting(HealthEventResponse::id).containsExactly(overdue.getId(), soon.getId());
        assertThat(due.get(0).herdName()).isEqualTo("Terneros");
    }

    @Test
    void ignoresDosesBeyondTheWindow() {
        AnimalHealthEvent far = event(animal(AnimalStatus.ACTIVO), null, "Aftosa",
                TODAY.minusDays(10), TODAY.plusDays(30));
        when(eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId))
                .thenReturn(List.of(far));

        assertThat(service.findDueDoses(farmId, 7)).isEmpty();
    }

    @Test
    void aLaterDoseOfTheSameProductReplacesTheOlderPendingOne() {
        Animal cow = animal(AnimalStatus.ACTIVO);
        AnimalHealthEvent older = event(cow, null, "Aftosa", TODAY.minusDays(200), TODAY.minusDays(20));
        AnimalHealthEvent newer = event(cow, null, "aftosa ", TODAY.minusDays(10), TODAY.plusDays(170));
        when(eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId))
                .thenReturn(List.of(newer, older));

        assertThat(service.findDueDoses(farmId, 7)).isEmpty();
    }

    @Test
    void aDoseOfAnotherProductDoesNotReplaceIt() {
        Animal cow = animal(AnimalStatus.ACTIVO);
        AnimalHealthEvent aftosa = event(cow, null, "Aftosa", TODAY.minusDays(200), TODAY.minusDays(20));
        AnimalHealthEvent ivermectina = event(cow, null, "Ivermectina", TODAY.minusDays(10), null);
        when(eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId))
                .thenReturn(List.of(ivermectina, aftosa));

        assertThat(service.findDueDoses(farmId, 7))
                .extracting(HealthEventResponse::id)
                .containsExactly(aftosa.getId());
    }

    @Test
    void ignoresAnimalsThatWereSoldOrDied() {
        AnimalHealthEvent sold = event(animal(AnimalStatus.VENDIDO), null, "Aftosa",
                TODAY.minusDays(100), TODAY.minusDays(5));
        AnimalHealthEvent dead = event(animal(AnimalStatus.MUERTO), null, "Aftosa",
                TODAY.minusDays(100), TODAY.plusDays(2));
        when(eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId))
                .thenReturn(List.of(sold, dead));

        assertThat(service.findDueDoses(farmId, 7)).isEmpty();
    }

    @Test
    void latestEventWithoutNextDoseClosesTheSeries() {
        Animal cow = animal(AnimalStatus.ACTIVO);
        AnimalHealthEvent first = event(cow, null, "Aftosa", TODAY.minusDays(100), TODAY.minusDays(10));
        AnimalHealthEvent last = event(cow, null, "Aftosa", TODAY.minusDays(5), null);
        when(eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId))
                .thenReturn(List.of(last, first));

        assertThat(service.findDueDoses(farmId, 7)).isEmpty();
    }
}
