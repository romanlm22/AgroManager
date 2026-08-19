package com.agromanager.farm;

import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    @Transactional
    public FarmResponse createFarm(FarmRequest request, User currentUser) {
        Farm farm = Farm.builder()
                .name(request.name())
                .description(request.description())
                .location(request.location())
                .totalAreaHa(request.totalAreaHa())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .build();

        farmRepository.save(farm);

        FarmUser farmUser = FarmUser.builder()
                .farm(farm)
                .user(currentUser)
                .farmRole(FarmRole.OWNER)
                .build();

        farmUserRepository.save(farmUser);

        return FarmResponse.fromEntity(farm, FarmRole.OWNER);
    }

    public List<FarmResponse> getMyFarms(User currentUser) {
        return farmUserRepository.findAllByUserId(currentUser.getId()).stream()
                .map(fu -> FarmResponse.fromEntity(fu.getFarm(), fu.getFarmRole()))
                .toList();
    }

    public FarmResponse getFarmById(UUID farmId, User currentUser) {
        FarmUser farmUser = getAuthorizedFarmUser(farmId, currentUser);
        return FarmResponse.fromEntity(farmUser.getFarm(), farmUser.getFarmRole());
    }

    @Transactional
    public FarmResponse updateFarm(UUID farmId, FarmRequest request, User currentUser) {
        FarmUser farmUser = getAuthorizedFarmUser(farmId, currentUser);
        Farm farm = farmUser.getFarm();

        farm.setName(request.name());
        farm.setDescription(request.description());
        farm.setLocation(request.location());
        farm.setTotalAreaHa(request.totalAreaHa());
        farm.setLatitude(request.latitude());
        farm.setLongitude(request.longitude());

        farmRepository.save(farm);

        return FarmResponse.fromEntity(farm, farmUser.getFarmRole());
    }

    @Transactional
    public void deleteFarm(UUID farmId, User currentUser) {
        FarmUser farmUser = getAuthorizedFarmUser(farmId, currentUser);

        if (farmUser.getFarmRole() != FarmRole.OWNER) {
            throw new FarmAccessDeniedException(
                    "Only the farm owner can delete this farm");
        }

        farmRepository.delete(farmUser.getFarm());
    }

    private FarmUser getAuthorizedFarmUser(UUID farmId, User currentUser) {
        return farmUserRepository.findByFarmIdAndUserId(farmId, currentUser.getId())
                .orElseThrow(() -> new FarmAccessDeniedException(
                        "You do not have access to this farm"));
    }
}