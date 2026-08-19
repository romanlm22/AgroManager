package com.agromanager.field;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FieldRepository extends JpaRepository<Field, UUID> {

    List<Field> findAllByFarmId(UUID farmId);

    Optional<Field> findByIdAndFarmId(UUID id, UUID farmId);
}