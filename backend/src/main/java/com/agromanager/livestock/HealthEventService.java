package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HealthEventService {

    private final AnimalHealthEventRepository eventRepository;
    private final LivestockAccess access;

    @Transactional
    public HealthEventResponse createEvent(UUID farmId, HealthEventRequest request, User currentUser) {
        Farm farm = access.getAuthorizedFarm(farmId, currentUser);
        validate(request);

        Animal animal = access.resolveAnimal(farmId, request.animalId());
        Herd herd = access.resolveHerd(farmId, request.herdId());

        AnimalHealthEvent event = AnimalHealthEvent.builder()
                .farm(farm)
                .animal(animal)
                .herd(herd)
                .eventType(request.eventType())
                .eventDate(request.eventDate())
                .product(request.product().trim())
                .dose(request.dose())
                .nextDoseDate(request.nextDoseDate())
                .cost(request.cost())
                .notes(request.notes())
                .build();

        eventRepository.save(event);

        return toResponse(event);
    }

    /**
     * Lista los eventos del establecimiento, del más reciente al más antiguo. Se puede
     * filtrar por animal o por rodeo (si vienen los dos, manda el animal).
     */
    @Transactional(readOnly = true)
    public List<HealthEventResponse> getEvents(
            UUID farmId, UUID animalId, UUID herdId, User currentUser) {

        access.getAuthorizedFarm(farmId, currentUser);

        List<AnimalHealthEvent> events;
        if (animalId != null) {
            events = eventRepository.findAllByFarmIdAndAnimalIdOrderByEventDateDescCreatedAtDesc(farmId, animalId);
        } else if (herdId != null) {
            events = eventRepository.findAllByFarmIdAndHerdIdOrderByEventDateDescCreatedAtDesc(farmId, herdId);
        } else {
            events = eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId);
        }

        Set<UUID> pending = pendingEventIds(events);

        return events.stream()
                .map(event -> HealthEventResponse.fromEntity(event, pending.contains(event.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public HealthEventResponse getEventById(UUID farmId, UUID eventId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        return toResponse(findEvent(farmId, eventId));
    }

    @Transactional
    public HealthEventResponse updateEvent(
            UUID farmId, UUID eventId, HealthEventRequest request, User currentUser) {

        access.getAuthorizedFarm(farmId, currentUser);
        validate(request);

        AnimalHealthEvent event = findEvent(farmId, eventId);

        event.setAnimal(access.resolveAnimal(farmId, request.animalId()));
        event.setHerd(access.resolveHerd(farmId, request.herdId()));
        event.setEventType(request.eventType());
        event.setEventDate(request.eventDate());
        event.setProduct(request.product().trim());
        event.setDose(request.dose());
        event.setNextDoseDate(request.nextDoseDate());
        event.setCost(request.cost());
        event.setNotes(request.notes());

        eventRepository.save(event);

        return toResponse(event);
    }

    @Transactional
    public void deleteEvent(UUID farmId, UUID eventId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        eventRepository.delete(findEvent(farmId, eventId));
    }

    /**
     * Próximas dosis pendientes (vencidas o dentro de la ventana) de animales activos y
     * rodeos, de la más próxima a la más lejana. No verifica acceso: solo debe llamarse desde servicios que ya autorizaron al usuario.
     */
    public List<HealthEventResponse> findDueDoses(UUID farmId, int windowDays) {
        List<AnimalHealthEvent> events =
                eventRepository.findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId);
        Set<UUID> pending = pendingEventIds(events);
        LocalDate limit = LocalDate.now().plusDays(windowDays);

        return events.stream()
                .filter(event -> pending.contains(event.getId()))
                .filter(event -> event.getAnimal() == null
                        || event.getAnimal().getStatus() == AnimalStatus.ACTIVO)
                .filter(event -> !event.getNextDoseDate().isAfter(limit))
                .sorted(Comparator.comparing(AnimalHealthEvent::getNextDoseDate))
                .map(event -> HealthEventResponse.fromEntity(event, true))
                .toList();
    }

    private AnimalHealthEvent findEvent(UUID farmId, UUID eventId) {
        return eventRepository.findByIdAndFarmId(eventId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Health event not found"));
    }

    private void validate(HealthEventRequest request) {
        if ((request.animalId() == null) == (request.herdId() == null)) {
            throw new InvalidLivestockRequestException("Exactly one of animalId or herdId is required");
        }
        if (request.nextDoseDate() != null && request.nextDoseDate().isBefore(request.eventDate())) {
            throw new InvalidLivestockRequestException("Next dose date cannot be before the event date");
        }
    }

    /** La próxima dosis de un evento solo cuenta si ningún evento posterior repite destino y producto. */
    private HealthEventResponse toResponse(AnimalHealthEvent event) {
        List<AnimalHealthEvent> sameTarget = event.getAnimal() != null
                ? eventRepository.findAllByAnimalId(event.getAnimal().getId())
                : eventRepository.findAllByHerdId(event.getHerd().getId());

        return HealthEventResponse.fromEntity(event, pendingEventIds(sameTarget).contains(event.getId()));
    }

    private Set<UUID> pendingEventIds(List<AnimalHealthEvent> events) {
        Comparator<AnimalHealthEvent> byRecency = Comparator
                .comparing(AnimalHealthEvent::getEventDate)
                .thenComparing(AnimalHealthEvent::getCreatedAt);

        Map<String, AnimalHealthEvent> latestByKey = new HashMap<>();
        for (AnimalHealthEvent event : events) {
            String target = event.getAnimal() != null
                    ? "A" + event.getAnimal().getId()
                    : "H" + event.getHerd().getId();
            String key = target + "|" + event.getProduct().trim().toLowerCase(Locale.ROOT);

            latestByKey.merge(key, event, (current, candidate) ->
                    byRecency.compare(candidate, current) > 0 ? candidate : current);
        }

        Set<UUID> pending = new HashSet<>();
        for (AnimalHealthEvent latest : latestByKey.values()) {
            if (latest.getNextDoseDate() != null) {
                pending.add(latest.getId());
            }
        }

        return pending;
    }
}
