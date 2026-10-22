package com.agromanager.livestock;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HerdRepository extends JpaRepository<Herd, UUID> {

    @EntityGraph(attributePaths = {"field"})
    List<Herd> findAllByFarmIdOrderByNameAsc(UUID farmId);

    @EntityGraph(attributePaths = {"field"})
    Optional<Herd> findByIdAndFarmId(UUID id, UUID farmId);
}
