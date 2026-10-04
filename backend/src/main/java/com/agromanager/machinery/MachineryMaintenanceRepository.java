package com.agromanager.machinery;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MachineryMaintenanceRepository extends JpaRepository<MachineryMaintenance, UUID> {

    List<MachineryMaintenance> findAllByMachineryId(UUID machineryId);

    Optional<MachineryMaintenance> findByIdAndMachineryId(UUID id, UUID machineryId);
}
