package com.agromanager.livestock;

import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnimalWeighingService {

    private final AnimalWeighingRepository weighingRepository;
    private final AnimalRepository animalRepository;
    private final LivestockAccess access;

    @Transactional
    public WeighingResponse createWeighing(
            UUID farmId, UUID animalId, WeighingRequest request, User currentUser) {

        Animal animal = getAuthorizedAnimal(farmId, animalId, currentUser);

        AnimalWeighing weighing = AnimalWeighing.builder()
                .animal(animal)
                .weighingDate(request.weighingDate())
                .weightKg(request.weightKg())
                .notes(request.notes())
                .build();

        weighingRepository.save(weighing);
        syncCurrentWeight(animal);

        return findResponse(animalId, weighing.getId());
    }

    /** Del más reciente al más antiguo. */
    @Transactional(readOnly = true)
    public List<WeighingResponse> getWeighings(UUID farmId, UUID animalId, User currentUser) {
        getAuthorizedAnimal(farmId, animalId, currentUser);

        List<WeighingResponse> responses = new ArrayList<>(buildResponses(animalId));
        Collections.reverse(responses);

        return responses;
    }

    @Transactional(readOnly = true)
    public WeighingResponse getWeighingById(
            UUID farmId, UUID animalId, UUID weighingId, User currentUser) {

        getAuthorizedAnimal(farmId, animalId, currentUser);

        return findResponse(animalId, weighingId);
    }

    @Transactional
    public WeighingResponse updateWeighing(
            UUID farmId, UUID animalId, UUID weighingId, WeighingRequest request, User currentUser) {

        Animal animal = getAuthorizedAnimal(farmId, animalId, currentUser);

        AnimalWeighing weighing = weighingRepository.findByIdAndAnimalId(weighingId, animalId)
                .orElseThrow(() -> new NoSuchElementException("Weighing not found"));

        weighing.setWeighingDate(request.weighingDate());
        weighing.setWeightKg(request.weightKg());
        weighing.setNotes(request.notes());

        weighingRepository.save(weighing);
        syncCurrentWeight(animal);

        return findResponse(animalId, weighingId);
    }

    @Transactional
    public void deleteWeighing(UUID farmId, UUID animalId, UUID weighingId, User currentUser) {
        Animal animal = getAuthorizedAnimal(farmId, animalId, currentUser);

        AnimalWeighing weighing = weighingRepository.findByIdAndAnimalId(weighingId, animalId)
                .orElseThrow(() -> new NoSuchElementException("Weighing not found"));

        weighingRepository.delete(weighing);
        syncCurrentWeight(animal);
    }

    private Animal getAuthorizedAnimal(UUID farmId, UUID animalId, User currentUser) {
        access.getAuthorizedFarm(farmId, currentUser);

        return animalRepository.findByIdAndFarmId(animalId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Animal not found"));
    }

    /**
     * El peso actual del animal es el del último pesaje. Si ya no quedan pesajes,
     * el peso actual queda vacío.
     */
    private void syncCurrentWeight(Animal animal) {
        animal.setCurrentWeightKg(
                weighingRepository.findFirstByAnimalIdOrderByWeighingDateDescCreatedAtDesc(animal.getId())
                        .map(AnimalWeighing::getWeightKg)
                        .orElse(null));

        animalRepository.save(animal);
    }

    private WeighingResponse findResponse(UUID animalId, UUID weighingId) {
        return buildResponses(animalId).stream()
                .filter(response -> response.id().equals(weighingId))
                .findFirst()
                .orElseThrow(() -> new NoSuchElementException("Weighing not found"));
    }

    /** Del más antiguo al más reciente, con la ganancia respecto del pesaje anterior. */
    private List<WeighingResponse> buildResponses(UUID animalId) {
        List<AnimalWeighing> weighings =
                weighingRepository.findAllByAnimalIdOrderByWeighingDateAscCreatedAtAsc(animalId);

        List<WeighingResponse> responses = new ArrayList<>();
        AnimalWeighing previous = null;
        for (AnimalWeighing weighing : weighings) {
            responses.add(WeighingResponse.fromEntity(weighing, previous));
            previous = weighing;
        }

        return responses;
    }
}
