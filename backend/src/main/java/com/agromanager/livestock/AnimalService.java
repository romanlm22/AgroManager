package com.agromanager.livestock;

import com.agromanager.farm.Farm;
import com.agromanager.field.Field;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final AnimalMovementRepository movementRepository;
    private final LivestockProductionRepository productionRepository;
    private final LivestockAccess access;

    @Transactional
    public AnimalResponse createAnimal(UUID farmId, AnimalRequest request, User currentUser) {
        Farm farm = access.getAuthorizedFarm(farmId, currentUser);

        String tagNumber = request.tagNumber().trim();
        if (animalRepository.existsByFarmIdAndTagNumber(farmId, tagNumber)) {
            throw new DuplicateTagNumberException(List.of(tagNumber));
        }

        Herd herd = access.resolveHerd(farmId, request.herdId());
        Field field = resolveInitialField(farmId, request.fieldId(), herd);

        Animal animal = Animal.builder()
                .farm(farm)
                .tagNumber(tagNumber)
                .sex(request.sex())
                .breed(request.breed())
                .birthDate(request.birthDate())
                .category(request.category())
                .status(request.status())
                .currentWeightKg(request.currentWeightKg())
                .herd(herd)
                .field(field)
                .notes(request.notes())
                .build();

        animalRepository.save(animal);

        return AnimalResponse.fromEntity(animal);
    }

    @Transactional
    public List<AnimalResponse> createAnimalsBulk(UUID farmId, BulkAnimalRequest request, User currentUser) {
        Farm farm = access.getAuthorizedFarm(farmId, currentUser);

        // Se descartan repetidas dentro del mismo pedido, conservando el orden.
        Set<String> tagNumbers = new LinkedHashSet<>();
        for (String tag : request.tagNumbers()) {
            tagNumbers.add(tag.trim());
        }

        List<String> existing = animalRepository.findAllByFarmIdAndTagNumberIn(farmId, tagNumbers).stream()
                .map(Animal::getTagNumber)
                .sorted()
                .toList();
        if (!existing.isEmpty()) {
            throw new DuplicateTagNumberException(existing);
        }

        Herd herd = access.resolveHerd(farmId, request.herdId());
        Field field = resolveInitialField(farmId, request.fieldId(), herd);

        List<Animal> animals = new ArrayList<>();
        for (String tagNumber : tagNumbers) {
            animals.add(Animal.builder()
                    .farm(farm)
                    .tagNumber(tagNumber)
                    .sex(request.sex())
                    .breed(request.breed())
                    .birthDate(request.birthDate())
                    .category(request.category())
                    .herd(herd)
                    .field(field)
                    .notes(request.notes())
                    .build());
        }

        return animalRepository.saveAll(animals).stream()
                .map(AnimalResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AnimalResponse> getAnimalsByFarm(UUID farmId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        return animalRepository.findAllByFarmIdOrderByTagNumberAsc(farmId).stream()
                .map(AnimalResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnimalResponse getAnimalById(UUID farmId, UUID animalId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        return AnimalResponse.fromEntity(findAnimal(farmId, animalId));
    }

    @Transactional
    public AnimalResponse updateAnimal(UUID farmId, UUID animalId, AnimalRequest request, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Animal animal = findAnimal(farmId, animalId);

        String tagNumber = request.tagNumber().trim();
        if (!tagNumber.equals(animal.getTagNumber())
                && animalRepository.existsByFarmIdAndTagNumber(farmId, tagNumber)) {
            throw new DuplicateTagNumberException(List.of(tagNumber));
        }

        Herd herd = access.resolveHerd(farmId, request.herdId());
        Field newField = access.resolveField(farmId, request.fieldId());

        animal.setTagNumber(tagNumber);
        animal.setSex(request.sex());
        animal.setBreed(request.breed());
        animal.setBirthDate(request.birthDate());
        animal.setCategory(request.category());
        if (request.status() != null) {
            animal.setStatus(request.status());
        }
        animal.setCurrentWeightKg(request.currentWeightKg());
        animal.setHerd(herd);
        animal.setNotes(request.notes());

        // Cualquier cambio de potrero queda en el historial de movimientos.
        recordFieldChange(animal, newField, LocalDate.now(), null);

        animalRepository.save(animal);

        return AnimalResponse.fromEntity(animal);
    }

    @Transactional
    public AnimalResponse moveAnimal(UUID farmId, UUID animalId, MoveRequest request, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Animal animal = findAnimal(farmId, animalId);

        if (animal.getStatus() != AnimalStatus.ACTIVO) {
            throw new InvalidLivestockRequestException("Only active animals can be moved");
        }

        Field destination = access.resolveField(farmId, request.toFieldId());
        if (animal.getField() != null && animal.getField().getId().equals(destination.getId())) {
            throw new InvalidLivestockRequestException("The animal is already in that field");
        }

        LocalDate date = request.movementDate() != null ? request.movementDate() : LocalDate.now();
        recordFieldChange(animal, destination, date, request.notes());

        animalRepository.save(animal);

        return AnimalResponse.fromEntity(animal);
    }

    /**
     * Baja de un animal activo: pasa a VENDIDO o MUERTO. Si se vendió y se informa el
     * peso final, se registra además una producción de CARNE (con el precio por kg, si
     * se indicó) vinculada al animal.
     */
    @Transactional
    public AnimalResponse retireAnimal(UUID farmId, UUID animalId, RetireRequest request, User currentUser) {
        Farm farm = access.getAuthorizedFarm(farmId, currentUser);

        Animal animal = findAnimal(farmId, animalId);

        if (animal.getStatus() != AnimalStatus.ACTIVO) {
            throw new InvalidLivestockRequestException("Only active animals can be retired");
        }
        if (request.status() == AnimalStatus.ACTIVO) {
            throw new InvalidLivestockRequestException("Retirement status must be VENDIDO or MUERTO");
        }
        if (request.status() == AnimalStatus.MUERTO
                && (request.finalWeightKg() != null || request.pricePerKg() != null)) {
            throw new InvalidLivestockRequestException("Final weight and price only apply to sold animals");
        }
        if (request.pricePerKg() != null && request.finalWeightKg() == null) {
            throw new InvalidLivestockRequestException("Price per kg requires the final weight");
        }

        LocalDate date = request.retireDate() != null ? request.retireDate() : LocalDate.now();

        animal.setStatus(request.status());
        animalRepository.save(animal);

        if (request.finalWeightKg() != null) {
            productionRepository.save(LivestockProduction.builder()
                    .farm(farm)
                    .productType(LivestockProductType.CARNE)
                    .productionDate(date)
                    .quantity(request.finalWeightKg())
                    .unit(ProductionUnit.KG)
                    .animal(animal)
                    .pricePerUnit(request.pricePerKg())
                    .notes("Venta del animal " + animal.getTagNumber())
                    .build());
        }

        return AnimalResponse.fromEntity(animal);
    }

    @Transactional(readOnly = true)
    public List<AnimalMovementResponse> getMovements(UUID farmId, UUID animalId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        findAnimal(farmId, animalId);

        return movementRepository.findAllByAnimalId(animalId).stream()
                .map(AnimalMovementResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteAnimal(UUID farmId, UUID animalId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        Animal animal = findAnimal(farmId, animalId);

        animalRepository.delete(animal);
    }

    private Animal findAnimal(UUID farmId, UUID animalId) {
        return animalRepository.findByIdAndFarmId(animalId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Animal not found"));
    }

    /**
     * Potrero inicial de un animal nuevo: el indicado, o el del rodeo si no se
     * indicó ninguno. Un alta no genera movimiento.
     */
    private Field resolveInitialField(UUID farmId, UUID fieldId, Herd herd) {
        Field field = access.resolveField(farmId, fieldId);

        if (field == null && herd != null) {
            return herd.getField();
        }

        return field;
    }

    private void recordFieldChange(Animal animal, Field newField, LocalDate date, String notes) {
        Field current = animal.getField();

        boolean unchanged = (current == null && newField == null)
                || (current != null && newField != null && current.getId().equals(newField.getId()));
        if (unchanged) {
            return;
        }

        movementRepository.save(AnimalMovement.builder()
                .animal(animal)
                .fromField(current)
                .toField(newField)
                .movementDate(date)
                .notes(notes)
                .build());

        animal.setField(newField);
    }
}
