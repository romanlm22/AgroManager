package com.agromanager.crop;

import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.field.Field;
import com.agromanager.field.FieldRepository;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CropService {

    private final CropRepository cropRepository;
    private final CropTypeRepository cropTypeRepository;
    private final FieldRepository fieldRepository;
    private final FarmUserRepository farmUserRepository;

    @Transactional
    public CropResponse createCrop(UUID farmId, UUID fieldId, CropRequest request, User currentUser) {
        Field field = getAuthorizedField(farmId, fieldId, currentUser);
        CropType cropType = getCropType(request.cropTypeId());

        Crop crop = Crop.builder()
                .field(field)
                .cropType(cropType)
                .plantingDate(request.plantingDate())
                .estimatedHarvestDate(request.estimatedHarvestDate())
                .actualHarvestDate(request.actualHarvestDate())
                .plantedAreaHa(request.plantedAreaHa())
                .yieldKgHa(request.yieldKgHa())
                .status(request.status())
                .build();

        cropRepository.save(crop);

        return CropResponse.fromEntity(crop);
    }

    public List<CropResponse> getCropsByField(UUID farmId, UUID fieldId, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        return cropRepository.findAllByFieldId(fieldId).stream()
                .map(CropResponse::fromEntity)
                .toList();
    }

    public CropResponse getCropById(UUID farmId, UUID fieldId, UUID cropId, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        Crop crop = cropRepository.findByIdAndFieldId(cropId, fieldId)
                .orElseThrow(() -> new NoSuchElementException("Crop not found"));

        return CropResponse.fromEntity(crop);
    }

    @Transactional
    public CropResponse updateCrop(UUID farmId, UUID fieldId, UUID cropId, CropRequest request, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        Crop crop = cropRepository.findByIdAndFieldId(cropId, fieldId)
                .orElseThrow(() -> new NoSuchElementException("Crop not found"));

        CropType cropType = getCropType(request.cropTypeId());

        crop.setCropType(cropType);
        crop.setPlantingDate(request.plantingDate());
        crop.setEstimatedHarvestDate(request.estimatedHarvestDate());
        crop.setActualHarvestDate(request.actualHarvestDate());
        crop.setPlantedAreaHa(request.plantedAreaHa());
        crop.setYieldKgHa(request.yieldKgHa());
        if (request.status() != null) {
            crop.setStatus(request.status());
        }

        cropRepository.save(crop);

        return CropResponse.fromEntity(crop);
    }

    @Transactional
    public void deleteCrop(UUID farmId, UUID fieldId, UUID cropId, User currentUser) {
        getAuthorizedField(farmId, fieldId, currentUser);

        Crop crop = cropRepository.findByIdAndFieldId(cropId, fieldId)
                .orElseThrow(() -> new NoSuchElementException("Crop not found"));

        cropRepository.delete(crop);
    }

    private Field getAuthorizedField(UUID farmId, UUID fieldId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return fieldRepository.findByIdAndFarmId(fieldId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Field not found"));
    }

    private CropType getCropType(UUID cropTypeId) {
        return cropTypeRepository.findById(cropTypeId)
                .orElseThrow(() -> new NoSuchElementException("Crop type not found"));
    }
}