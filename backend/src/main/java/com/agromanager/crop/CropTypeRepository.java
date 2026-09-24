package com.agromanager.crop;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CropTypeRepository extends JpaRepository<CropType, UUID> {
}