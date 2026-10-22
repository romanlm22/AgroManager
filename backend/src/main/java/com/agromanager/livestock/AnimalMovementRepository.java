package com.agromanager.livestock;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AnimalMovementRepository extends JpaRepository<AnimalMovement, UUID> {

    @Query("""
            select m from AnimalMovement m
            left join fetch m.fromField
            left join fetch m.toField
            where m.animal.id = :animalId
            order by m.movementDate desc, m.createdAt desc
            """)
    List<AnimalMovement> findAllByAnimalId(@Param("animalId") UUID animalId);
}
