package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import com.agromanager.field.Field;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HerdService {

    private final HerdRepository herdRepository;
    private final AnimalRepository animalRepository;
    private final AnimalMovementRepository movementRepository;
    private final LivestockAccess access;

    @Transactional
    public HerdResponse createHerd(UUID farmId, HerdRequest request, User currentUser) {
        Farm farm = access.getAuthorizedFarm(farmId, currentUser);
        Field field = access.resolveField(farmId, request.fieldId());

        Herd herd = Herd.builder()
                .farm(farm)
                .name(request.name().trim())
                .category(request.category())
                .field(field)
                .manualHeadCount(request.manualHeadCount())
                .notes(request.notes())
                .build();

        herdRepository.save(herd);

        return HerdResponse.fromEntity(herd, 0);
    }

    @Transactional(readOnly = true)
    public List<HerdResponse> getHerdsByFarm(UUID farmId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Map<UUID, Long> trackedByHerd = new HashMap<>();
        for (HerdAnimalCount count : animalRepository.countByHerd(farmId, AnimalStatus.ACTIVO)) {
            trackedByHerd.put(count.getHerdId(), count.getTotal());
        }

        return herdRepository.findAllByFarmIdOrderByNameAsc(farmId).stream()
                .map(herd -> HerdResponse.fromEntity(herd, trackedByHerd.getOrDefault(herd.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public HerdResponse getHerdById(UUID farmId, UUID herdId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Herd herd = findHerd(farmId, herdId);

        return toResponse(herd);
    }

    @Transactional
    public HerdResponse updateHerd(UUID farmId, UUID herdId, HerdRequest request, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Herd herd = findHerd(farmId, herdId);
        Field newField = access.resolveField(farmId, request.fieldId());

        herd.setName(request.name().trim());
        herd.setCategory(request.category());
        if (request.manualHeadCount() != null) {
            herd.setManualHeadCount(request.manualHeadCount());
        }
        herd.setNotes(request.notes());

        // Si cambia el potrero, los animales activos del rodeo lo acompañan.
        applyFieldChange(herd, newField, LocalDate.now(), null);

        herdRepository.save(herd);

        return toResponse(herd);
    }

    @Transactional
    public HerdResponse moveHerd(UUID farmId, UUID herdId, MoveRequest request, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Herd herd = findHerd(farmId, herdId);
        Field destination = access.resolveField(farmId, request.toFieldId());
        LocalDate date = request.movementDate() != null ? request.movementDate() : LocalDate.now();

        applyFieldChange(herd, destination, date, request.notes());

        herdRepository.save(herd);

        return toResponse(herd);
    }

    @Transactional
    public void deleteHerd(UUID farmId, UUID herdId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Herd herd = findHerd(farmId, herdId);

        // Los animales no se borran: la base los deja sin rodeo (ON DELETE SET NULL).
        herdRepository.delete(herd);
    }

    private Herd findHerd(UUID farmId, UUID herdId) {
        return herdRepository.findByIdAndFarmId(herdId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Herd not found"));
    }

    private HerdResponse toResponse(Herd herd) {
        long tracked = animalRepository.countByHerdIdAndStatus(herd.getId(), AnimalStatus.ACTIVO);
        return HerdResponse.fromEntity(herd, tracked);
    }

    /**
     * Asigna el potrero al rodeo y mueve con él a los animales activos que estén en
     * otro lugar, dejando un movimiento registrado por cada uno.
     */
    private void applyFieldChange(Herd herd, Field newField, LocalDate date, String notes) {
        herd.setField(newField);

        List<Animal> animals = animalRepository.findAllByHerdIdAndStatus(herd.getId(), AnimalStatus.ACTIVO);

        for (Animal animal : animals) {
            if (sameField(animal.getField(), newField)) {
                continue;
            }

            movementRepository.save(AnimalMovement.builder()
                    .animal(animal)
                    .fromField(animal.getField())
                    .toField(newField)
                    .movementDate(date)
                    .notes(notes)
                    .build());

            animal.setField(newField);
        }
    }

    private boolean sameField(Field a, Field b) {
        if (a == null || b == null) {
            return a == b;
        }
        return a.getId().equals(b.getId());
    }
}
