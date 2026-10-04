package com.agromanager.machinery;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MachineryRepository extends JpaRepository<Machinery, UUID> {

    List<Machinery> findAllByFarmId(UUID farmId);

    Optional<Machinery> findByIdAndFarmId(UUID id, UUID farmId);
}
