package com.agromanager.crop;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CropRepository extends JpaRepository<Crop, UUID> {

    List<Crop> findAllByFieldId(UUID fieldId);

    Optional<Crop> findByIdAndFieldId(UUID id, UUID fieldId);
}