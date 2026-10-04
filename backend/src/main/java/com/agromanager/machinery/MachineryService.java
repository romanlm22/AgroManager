package com.agromanager.machinery;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
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
public class MachineryService {

    private final MachineryRepository machineryRepository;
    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    @Transactional
    public MachineryResponse createMachinery(UUID farmId, MachineryRequest request, User currentUser) {
        Farm farm = getAuthorizedFarm(farmId, currentUser);

        Machinery machinery = Machinery.builder()
                .farm(farm)
                .name(request.name())
                .machineryType(request.machineryType())
                .brand(request.brand())
                .model(request.model())
                .year(request.year())
                .hoursUsed(request.hoursUsed())
                .status(request.status())
                .nextMaintenanceDate(request.nextMaintenanceDate())
                .build();

        machineryRepository.save(machinery);

        return MachineryResponse.fromEntity(machinery);
    }

    public List<MachineryResponse> getMachineryByFarm(UUID farmId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        return machineryRepository.findAllByFarmId(farmId).stream()
                .map(MachineryResponse::fromEntity)
                .toList();
    }

    public MachineryResponse getMachineryById(UUID farmId, UUID machineryId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        Machinery machinery = machineryRepository.findByIdAndFarmId(machineryId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Machinery not found"));

        return MachineryResponse.fromEntity(machinery);
    }

    @Transactional
    public MachineryResponse updateMachinery(UUID farmId, UUID machineryId, MachineryRequest request, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        Machinery machinery = machineryRepository.findByIdAndFarmId(machineryId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Machinery not found"));

        machinery.setName(request.name());
        machinery.setMachineryType(request.machineryType());
        machinery.setBrand(request.brand());
        machinery.setModel(request.model());
        machinery.setYear(request.year());
        machinery.setHoursUsed(request.hoursUsed());
        if (request.status() != null) {
            machinery.setStatus(request.status());
        }
        machinery.setNextMaintenanceDate(request.nextMaintenanceDate());

        machineryRepository.save(machinery);

        return MachineryResponse.fromEntity(machinery);
    }

    @Transactional
    public void deleteMachinery(UUID farmId, UUID machineryId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        Machinery machinery = machineryRepository.findByIdAndFarmId(machineryId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Machinery not found"));

        machineryRepository.delete(machinery);
    }

    private Farm getAuthorizedFarm(UUID farmId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return farmRepository.findById(farmId)
                .orElseThrow(() -> new NoSuchElementException("Farm not found"));
    }
}
