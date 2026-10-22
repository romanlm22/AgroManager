package com.agromanager.livestock;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnimalWeighingRepository extends JpaRepository<AnimalWeighing, UUID> {

    List<AnimalWeighing> findAllByAnimalIdOrderByWeighingDateAscCreatedAtAsc(UUID animalId);

    Optional<AnimalWeighing> findByIdAndAnimalId(UUID id, UUID animalId);

    Optional<AnimalWeighing> findFirstByAnimalIdOrderByWeighingDateDescCreatedAtDesc(UUID animalId);

    /** Pesajes de los animales del establecimiento con el estado dado, en orden cronológico. */
    List<AnimalWeighing> findAllByAnimal_Farm_IdAndAnimal_StatusOrderByWeighingDateAscCreatedAtAsc(
            UUID farmId, AnimalStatus status);
}
