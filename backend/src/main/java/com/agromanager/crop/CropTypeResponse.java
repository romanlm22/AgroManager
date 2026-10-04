package com.agromanager.crop;

import java.util.UUID;

public record CropTypeResponse(
        UUID id,
        String name
) {
    public static CropTypeResponse fromEntity(CropType cropType) {
        return new CropTypeResponse(cropType.getId(), cropType.getName());
    }
}