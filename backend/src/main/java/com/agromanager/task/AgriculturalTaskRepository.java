package com.agromanager.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgriculturalTaskRepository extends JpaRepository<AgriculturalTask, UUID> {

    List<AgriculturalTask> findAllByFieldId(UUID fieldId);

    Optional<AgriculturalTask> findByIdAndFieldId(UUID id, UUID fieldId);

    List<AgriculturalTask> findAllByField_Farm_Id(UUID farmId);
}
