package com.agromanager.livestock;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/** Estado reproductivo de una hembra a partir de su historia de eventos (en orden cronológico). */
class ReproductionStatusTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 15);

    private final Animal cow = Animal.builder()
            .id(UUID.randomUUID())
            .tagNumber("AR-001")
            .sex(AnimalSex.HEMBRA)
            .build();

    private AnimalReproductionEvent service(LocalDate date) {
        return AnimalReproductionEvent.builder()
                .animal(cow)
                .eventType(ReproductionEventType.SERVICIO)
                .eventDate(date)
                .serviceType(ServiceType.NATURAL)
                .build();
    }

    private AnimalReproductionEvent tacto(LocalDate date, TactoResult result) {
        return AnimalReproductionEvent.builder()
                .animal(cow)
                .eventType(ReproductionEventType.TACTO)
                .eventDate(date)
                .tactoResult(result)
                .build();
    }

    private AnimalReproductionEvent event(ReproductionEventType type, LocalDate date) {
        return AnimalReproductionEvent.builder()
                .animal(cow)
                .eventType(type)
                .eventDate(date)
                .build();
    }

    private ReproductiveStatusResponse status(AnimalReproductionEvent... events) {
        return ReproductionService.computeStatus(cow, List.of(events), TODAY);
    }

    @Test
    void withoutEvents_isWithoutService() {
        ReproductiveStatusResponse result = status();

        assertThat(result.state()).isEqualTo(ReproductiveState.SIN_SERVICIO);
        assertThat(result.estimatedDueDate()).isNull();
        assertThat(result.daysToDue()).isNull();
    }

    @Test
    void serviceWithoutTacto_isInService() {
        LocalDate serviceDate = TODAY.minusDays(20);

        ReproductiveStatusResponse result = status(service(serviceDate));

        assertThat(result.state()).isEqualTo(ReproductiveState.EN_SERVICIO);
        assertThat(result.lastServiceDate()).isEqualTo(serviceDate);
        assertThat(result.estimatedDueDate()).isNull();
    }

    @Test
    void positiveTacto_isPregnantWithDueDateAfterTheGestationPeriod() {
        LocalDate serviceDate = TODAY.minusDays(60);

        ReproductiveStatusResponse result = status(
                service(serviceDate),
                tacto(TODAY.minusDays(20), TactoResult.PRENADA));

        LocalDate expectedDue = serviceDate.plusDays(ReproductionService.GESTATION_DAYS);
        assertThat(result.state()).isEqualTo(ReproductiveState.PRENADA);
        assertThat(result.estimatedDueDate()).isEqualTo(expectedDue);
        assertThat(result.daysToDue()).isEqualTo((int) ChronoUnit.DAYS.between(TODAY, expectedDue));
    }

    @Test
    void negativeTacto_isEmpty() {
        ReproductiveStatusResponse result = status(
                service(TODAY.minusDays(60)),
                tacto(TODAY.minusDays(20), TactoResult.VACIA));

        assertThat(result.state()).isEqualTo(ReproductiveState.VACIA);
        assertThat(result.estimatedDueDate()).isNull();
    }

    @Test
    void tactoOlderThanTheLastService_nolongerCounts() {
        ReproductiveStatusResponse result = status(
                service(TODAY.minusDays(100)),
                tacto(TODAY.minusDays(60), TactoResult.PRENADA),
                service(TODAY.minusDays(10)));

        assertThat(result.state()).isEqualTo(ReproductiveState.EN_SERVICIO);
        assertThat(result.lastServiceDate()).isEqualTo(TODAY.minusDays(10));
    }

    @Test
    void birth_closesTheCycle() {
        LocalDate birthDate = TODAY.minusDays(5);

        ReproductiveStatusResponse result = status(
                service(TODAY.minusDays(288)),
                tacto(TODAY.minusDays(250), TactoResult.PRENADA),
                event(ReproductionEventType.PARTO, birthDate));

        assertThat(result.state()).isEqualTo(ReproductiveState.SIN_SERVICIO);
        assertThat(result.lastBirthDate()).isEqualTo(birthDate);
        assertThat(result.estimatedDueDate()).isNull();
    }

    @Test
    void abortion_closesTheCycleWithoutRecordingABirth() {
        ReproductiveStatusResponse result = status(
                service(TODAY.minusDays(120)),
                tacto(TODAY.minusDays(90), TactoResult.PRENADA),
                event(ReproductionEventType.ABORTO, TODAY.minusDays(30)));

        assertThat(result.state()).isEqualTo(ReproductiveState.SIN_SERVICIO);
        assertThat(result.lastBirthDate()).isNull();
    }

    @Test
    void overdueBirth_hasNegativeDaysToDue() {
        ReproductiveStatusResponse result = status(
                service(TODAY.minusDays(290)),
                tacto(TODAY.minusDays(250), TactoResult.PRENADA));

        assertThat(result.state()).isEqualTo(ReproductiveState.PRENADA);
        assertThat(result.daysToDue()).isNegative();
    }

    @Test
    void newCycleAfterABirth_startsFromTheNewService() {
        ReproductiveStatusResponse result = status(
                service(TODAY.minusDays(400)),
                event(ReproductionEventType.PARTO, TODAY.minusDays(110)),
                service(TODAY.minusDays(30)));

        assertThat(result.state()).isEqualTo(ReproductiveState.EN_SERVICIO);
        assertThat(result.lastBirthDate()).isEqualTo(TODAY.minusDays(110));
    }
}
