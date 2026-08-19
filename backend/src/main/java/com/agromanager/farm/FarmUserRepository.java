package com.agromanager.farm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FarmUserRepository extends JpaRepository<FarmUser, UUID> {

    List<FarmUser> findAllByUserId(UUID userId);

    List<FarmUser> findAllByFarmId(UUID farmId);

    Optional<FarmUser> findByFarmIdAndUserId(UUID farmId, UUID userId);

    boolean existsByFarmIdAndUserId(UUID farmId, UUID userId);
}