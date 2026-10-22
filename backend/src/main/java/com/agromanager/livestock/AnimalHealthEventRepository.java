package com.agromanager.livestock;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnimalHealthEventRepository extends JpaRepository<AnimalHealthEvent, UUID> {

    @EntityGraph(attributePaths = {"animal", "herd"})
    List<AnimalHealthEvent> findAllByFarmIdOrderByEventDateDescCreatedAtDesc(UUID farmId);

    @EntityGraph(attributePaths = {"animal", "herd"})
    List<AnimalHealthEvent> findAllByFarmIdAndAnimalIdOrderByEventDateDescCreatedAtDesc(
            UUID farmId, UUID animalId);

    @EntityGraph(attributePaths = {"animal", "herd"})
    List<AnimalHealthEvent> findAllByFarmIdAndHerdIdOrderByEventDateDescCreatedAtDesc(
            UUID farmId, UUID herdId);

    @EntityGraph(attributePaths = {"animal", "herd"})
    Optional<AnimalHealthEvent> findByIdAndFarmId(UUID id, UUID farmId);

    @EntityGraph(attributePaths = {"animal", "herd"})
    List<AnimalHealthEvent> findAllByAnimalId(UUID animalId);

    @EntityGraph(attributePaths = {"animal", "herd"})
    List<AnimalHealthEvent> findAllByHerdId(UUID herdId);

    @Query("select coalesce(sum(e.cost), 0) from AnimalHealthEvent e where e.farm.id = :farmId")
    BigDecimal sumCostByFarmId(@Param("farmId") UUID farmId);
}
