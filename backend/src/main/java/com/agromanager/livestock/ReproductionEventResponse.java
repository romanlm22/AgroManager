package com.agromanager.livestock;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ReproductionEventResponse(
        UUID id,
        UUID farmId,
        UUID animalId,
        String animalTagNumber,
        ReproductionEventType eventType,
        LocalDate eventDate,
        ServiceType serviceType,
        UUID sireAnimalId,
        String sireTagNumber,
        String sireDescription,
        TactoResult tactoResult,
        UUID calfAnimalId,
        String calfTagNumber,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static ReproductionEventResponse fromEntity(AnimalReproductionEvent event) {
        Animal sire = event.getSireAnimal();
        Animal calf = event.getCalfAnimal();

        return new ReproductionEventResponse(
                event.getId(),
                event.getFarm().getId(),
                event.getAnimal().getId(),
                event.getAnimal().getTagNumber(),
                event.getEventType(),
                event.getEventDate(),
                event.getServiceType(),
                sire != null ? sire.getId() : null,
                sire != null ? sire.getTagNumber() : null,
                event.getSireDescription(),
                event.getTactoResult(),
                calf != null ? calf.getId() : null,
                calf != null ? calf.getTagNumber() : null,
                event.getNotes(),
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }
}
