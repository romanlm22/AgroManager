package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReproductionService {

    /** Gestación bovina promedio, en días. */
    static final int GESTATION_DAYS = 283;

    private final AnimalReproductionEventRepository eventRepository;
    private final AnimalRepository animalRepository;
    private final AnimalWeighingRepository weighingRepository;
    private final LivestockAccess access;

    @Transactional
    public ReproductionEventResponse createEvent(
            UUID farmId, ReproductionEventRequest request, User currentUser) {

        Farm farm = access.getAuthorizedFarm(farmId, currentUser);
        validateShape(request);

        Animal mother = resolveFemale(farmId, request.animalId());
        Animal sire = resolveSire(farmId, request);

        AnimalReproductionEvent event = AnimalReproductionEvent.builder()
                .farm(farm)
                .animal(mother)
                .eventType(request.eventType())
                .eventDate(request.eventDate())
                .serviceType(request.serviceType())
                .sireAnimal(sire)
                .sireDescription(request.sireDescription())
                .tactoResult(request.tactoResult())
                .notes(request.notes())
                .build();

        if (request.calf() != null) {
            event.setCalfAnimal(createCalf(farm, mother, request));
        }

        eventRepository.save(event);

        return ReproductionEventResponse.fromEntity(event);
    }

    /** Del más reciente al más antiguo; se puede filtrar por hembra. */
    @Transactional(readOnly = true)
    public List<ReproductionEventResponse> getEvents(UUID farmId, UUID animalId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        List<AnimalReproductionEvent> events = animalId != null
                ? eventRepository.findAllByFarmIdAndAnimalIdOrderByEventDateDescCreatedAtDesc(farmId, animalId)
                : eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId);

        return events.stream().map(ReproductionEventResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ReproductionEventResponse getEventById(UUID farmId, UUID eventId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        return ReproductionEventResponse.fromEntity(findEvent(farmId, eventId));
    }

    /**
     * Edita un evento. La cría solo se registra al crear el parto; si el evento deja
     * de ser un parto, se desvincula la cría (la ficha del ternero no se borra).
     */
    @Transactional
    public ReproductionEventResponse updateEvent(
            UUID farmId, UUID eventId, ReproductionEventRequest request, User currentUser) {

        access.getAuthorizedFarm(farmId, currentUser);
        validateShape(request);

        if (request.calf() != null) {
            throw new InvalidLivestockRequestException(
                    "A calf can only be registered when creating the birth event");
        }

        AnimalReproductionEvent event = findEvent(farmId, eventId);

        event.setAnimal(resolveFemale(farmId, request.animalId()));
        event.setEventType(request.eventType());
        event.setEventDate(request.eventDate());
        event.setServiceType(request.serviceType());
        event.setSireAnimal(resolveSire(farmId, request));
        event.setSireDescription(request.sireDescription());
        event.setTactoResult(request.tactoResult());
        event.setNotes(request.notes());
        if (request.eventType() != ReproductionEventType.PARTO) {
            event.setCalfAnimal(null);
        }

        eventRepository.save(event);

        return ReproductionEventResponse.fromEntity(event);
    }

    @Transactional
    public void deleteEvent(UUID farmId, UUID eventId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        // Si el parto tenía cría, su ficha se conserva.
        eventRepository.delete(findEvent(farmId, eventId));
    }

    /**
     * Estado reproductivo de cada hembra activa que tiene al menos un evento,
     * ordenado por fecha estimada de parto (las que no tienen, al final).
     */
    @Transactional(readOnly = true)
    public List<ReproductiveStatusResponse> getReproductiveStatus(UUID farmId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        return computeStatuses(farmId);
    }

    /** Igual que getReproductiveStatus, pero sin verificar acceso: el llamador ya lo hizo. */
    public List<ReproductiveStatusResponse> computeStatuses(UUID farmId) {
        Map<UUID, List<AnimalReproductionEvent>> byAnimal = new LinkedHashMap<>();
        for (AnimalReproductionEvent event : eventRepository.findAllByFarmIdOrderByEventDateAscCreatedAtAsc(farmId)) {
            byAnimal.computeIfAbsent(event.getAnimal().getId(), id -> new ArrayList<>()).add(event);
        }

        LocalDate today = LocalDate.now();
        List<ReproductiveStatusResponse> statuses = new ArrayList<>();

        for (List<AnimalReproductionEvent> events : byAnimal.values()) {
            Animal animal = events.get(0).getAnimal();
            if (animal.getStatus() != AnimalStatus.ACTIVO) {
                continue;
            }
            statuses.add(computeStatus(animal, events, today));
        }

        statuses.sort(Comparator
                .comparing(ReproductiveStatusResponse::estimatedDueDate,
                        Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(ReproductiveStatusResponse::animalTagNumber));

        return statuses;
    }

    /** Eventos en orden cronológico. El parto o aborto cierra el ciclo y lo reinicia. */
    static ReproductiveStatusResponse computeStatus(
            Animal animal, List<AnimalReproductionEvent> events, LocalDate today) {

        AnimalReproductionEvent lastService = null;
        AnimalReproductionEvent lastTacto = null;
        LocalDate lastBirth = null;

        for (AnimalReproductionEvent event : events) {
            switch (event.getEventType()) {
                case SERVICIO -> lastService = event;
                case TACTO -> lastTacto = event;
                case PARTO, ABORTO -> {
                    lastService = null;
                    lastTacto = null;
                    if (event.getEventType() == ReproductionEventType.PARTO) {
                        lastBirth = event.getEventDate();
                    }
                }
            }
        }

        LocalDate serviceDate = lastService != null ? lastService.getEventDate() : null;
        LocalDate tactoDate = lastTacto != null ? lastTacto.getEventDate() : null;

        boolean tactoIsCurrent = lastTacto != null
                && (serviceDate == null || !tactoDate.isBefore(serviceDate));

        ReproductiveState state;
        LocalDate dueDate = null;

        if (tactoIsCurrent && lastTacto.getTactoResult() == TactoResult.PRENADA) {
            state = ReproductiveState.PRENADA;
            if (serviceDate != null) {
                dueDate = serviceDate.plusDays(GESTATION_DAYS);
            }
        } else if (tactoIsCurrent) {
            state = ReproductiveState.VACIA;
        } else if (lastService != null) {
            state = ReproductiveState.EN_SERVICIO;
        } else {
            state = ReproductiveState.SIN_SERVICIO;
        }

        Integer daysToDue = dueDate != null ? (int) ChronoUnit.DAYS.between(today, dueDate) : null;

        return new ReproductiveStatusResponse(
                animal.getId(),
                animal.getTagNumber(),
                state,
                serviceDate,
                tactoDate,
                lastBirth,
                dueDate,
                daysToDue
        );
    }

    private AnimalReproductionEvent findEvent(UUID farmId, UUID eventId) {
        return eventRepository.findByIdAndFarmId(eventId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Reproduction event not found"));
    }

    private Animal resolveFemale(UUID farmId, UUID animalId) {
        Animal animal = access.resolveAnimal(farmId, animalId);

        if (animal.getSex() != AnimalSex.HEMBRA) {
            throw new InvalidLivestockRequestException("Reproduction events apply to female animals only");
        }

        return animal;
    }

    private Animal resolveSire(UUID farmId, ReproductionEventRequest request) {
        Animal sire = access.resolveAnimal(farmId, request.sireAnimalId());

        if (sire != null && sire.getSex() != AnimalSex.MACHO) {
            throw new InvalidLivestockRequestException("The sire must be a male animal");
        }

        return sire;
    }

    /** Cada dato solo se admite en el tipo de evento al que pertenece. */
    private void validateShape(ReproductionEventRequest request) {
        ReproductionEventType type = request.eventType();
        boolean hasServiceData = request.serviceType() != null
                || request.sireAnimalId() != null
                || (request.sireDescription() != null && !request.sireDescription().isBlank());

        if (type == ReproductionEventType.SERVICIO) {
            if (request.serviceType() == null) {
                throw new InvalidLivestockRequestException("Service type is required for a service");
            }
        } else if (hasServiceData) {
            throw new InvalidLivestockRequestException("Service type and sire only apply to a service");
        }

        if (type == ReproductionEventType.TACTO) {
            if (request.tactoResult() == null) {
                throw new InvalidLivestockRequestException("Result is required for a pregnancy check");
            }
        } else if (request.tactoResult() != null) {
            throw new InvalidLivestockRequestException("Result only applies to a pregnancy check");
        }

        if (request.calf() != null && type != ReproductionEventType.PARTO) {
            throw new InvalidLivestockRequestException("A calf can only be registered in a birth event");
        }
    }

    /**
     * Crea la ficha de la cría: nace en la fecha del parto, hereda rodeo y potrero de la
     * madre y queda vinculada a ella. Con peso al nacer, se registra su primer pesaje.
     */
    private Animal createCalf(Farm farm, Animal mother, ReproductionEventRequest request) {
        ReproductionEventRequest.CalfRequest calfRequest = request.calf();
        String tagNumber = calfRequest.tagNumber().trim();

        if (animalRepository.existsByFarmIdAndTagNumber(farm.getId(), tagNumber)) {
            throw new DuplicateTagNumberException(List.of(tagNumber));
        }

        Animal calf = Animal.builder()
                .farm(farm)
                .tagNumber(tagNumber)
                .sex(calfRequest.sex())
                .birthDate(request.eventDate())
                .category(LivestockCategory.TERNERO)
                .currentWeightKg(calfRequest.birthWeightKg())
                .herd(mother.getHerd())
                .field(mother.getField())
                .mother(mother)
                .build();

        animalRepository.save(calf);

        if (calfRequest.birthWeightKg() != null) {
            weighingRepository.save(AnimalWeighing.builder()
                    .animal(calf)
                    .weighingDate(request.eventDate())
                    .weightKg(calfRequest.birthWeightKg())
                    .notes("Peso al nacer")
                    .build());
        }

        return calf;
    }
}
