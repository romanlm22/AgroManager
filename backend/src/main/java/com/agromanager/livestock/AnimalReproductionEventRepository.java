package com.agromanager.livestock;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnimalReproductionEventRepository extends JpaRepository<AnimalReproductionEvent, UUID> {

    @EntityGraph(attributePaths = {"animal", "sireAnimal", "calfAnimal"})
    List<AnimalReproductionEvent> findAllByFarmIdOrderByEventDateDescCreatedAtDesc(UUID farmId);

    @EntityGraph(attributePaths = {"animal", "sireAnimal", "calfAnimal"})
    List<AnimalReproductionEvent> findAllByFarmIdAndAnimalIdOrderByEventDateDescCreatedAtDesc(
            UUID farmId, UUID animalId);

    @EntityGraph(attributePaths = {"animal", "sireAnimal", "calfAnimal"})
    List<AnimalReproductionEvent> findAllByFarmIdOrderByEventDateAscCreatedAtAsc(UUID farmId);

    @EntityGraph(attributePaths = {"animal", "sireAnimal", "calfAnimal"})
    Optional<AnimalReproductionEvent> findByIdAndFarmId(UUID id, UUID farmId);
}
