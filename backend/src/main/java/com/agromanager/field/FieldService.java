package com.agromanager.field;

import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FieldService {

    private final FieldRepository fieldRepository;
    private final com.agromanager.farm.FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    @Transactional
    public FieldResponse createField(UUID farmId, FieldRequest request, User currentUser) {
        var farm = getAuthorizedFarm(farmId, currentUser);

        Field field = Field.builder()
                .farm(farm)
                .name(request.name())
                .areaHa(request.areaHa())
                .soilType(request.soilType())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .status(request.status())
                .notes(request.notes())
                .build();

        fieldRepository.save(field);

        return FieldResponse.fromEntity(field);
    }

    public List<FieldResponse> getFieldsByFarm(UUID farmId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        return fieldRepository.findAllByFarmId(farmId).stream()
                .map(FieldResponse::fromEntity)
                .toList();
    }

    public FieldResponse getFieldById(UUID farmId, UUID fieldId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        Field field = fieldRepository.findByIdAndFarmId(fieldId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Field not found"));

        return FieldResponse.fromEntity(field);
    }

    @Transactional
    public FieldResponse updateField(UUID farmId, UUID fieldId, FieldRequest request, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        Field field = fieldRepository.findByIdAndFarmId(fieldId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Field not found"));

        field.setName(request.name());
        field.setAreaHa(request.areaHa());
        field.setSoilType(request.soilType());
        field.setLatitude(request.latitude());
        field.setLongitude(request.longitude());
        if (request.status() != null) {
            field.setStatus(request.status());
        }
        field.setNotes(request.notes());

        fieldRepository.save(field);

        return FieldResponse.fromEntity(field);
    }

    @Transactional
    public void deleteField(UUID farmId, UUID fieldId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        Field field = fieldRepository.findByIdAndFarmId(fieldId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Field not found"));

        fieldRepository.delete(field);
    }

    private com.agromanager.farm.Farm getAuthorizedFarm(UUID farmId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return farmRepository.findById(farmId)
                .orElseThrow(() -> new NoSuchElementException("Farm not found"));
    }
}