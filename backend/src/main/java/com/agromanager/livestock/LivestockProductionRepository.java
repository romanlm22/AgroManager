package com.agromanager.livestock;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LivestockProductionRepository extends JpaRepository<LivestockProduction, UUID> {

    @EntityGraph(attributePaths = {"herd", "animal"})
    List<LivestockProduction> findAllByFarmIdAndProductionDateBetweenOrderByProductionDateDescCreatedAtDesc(
            UUID farmId, LocalDate startDate, LocalDate endDate);

    @EntityGraph(attributePaths = {"herd", "animal"})
    Optional<LivestockProduction> findByIdAndFarmId(UUID id, UUID farmId);
}
