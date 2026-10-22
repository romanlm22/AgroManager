package com.agromanager.livestock;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnimalRepository extends JpaRepository<Animal, UUID> {

    @EntityGraph(attributePaths = {"herd", "field", "mother"})
    List<Animal> findAllByFarmIdOrderByTagNumberAsc(UUID farmId);

    @EntityGraph(attributePaths = {"herd", "field", "mother"})
    Optional<Animal> findByIdAndFarmId(UUID id, UUID farmId);

    boolean existsByFarmIdAndTagNumber(UUID farmId, String tagNumber);

    List<Animal> findAllByFarmIdAndTagNumberIn(UUID farmId, Collection<String> tagNumbers);

    @EntityGraph(attributePaths = {"field"})
    List<Animal> findAllByHerdIdAndStatus(UUID herdId, AnimalStatus status);

    long countByHerdIdAndStatus(UUID herdId, AnimalStatus status);

    @Query("""
            select a.herd.id as herdId, count(a) as total
            from Animal a
            where a.farm.id = :farmId and a.herd is not null and a.status = :status
            group by a.herd.id
            """)
    List<HerdAnimalCount> countByHerd(@Param("farmId") UUID farmId, @Param("status") AnimalStatus status);
}
