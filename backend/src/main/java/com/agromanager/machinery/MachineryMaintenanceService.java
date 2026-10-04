package com.agromanager.machinery;

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
public class MachineryMaintenanceService {

    private final MachineryMaintenanceRepository maintenanceRepository;
    private final MachineryRepository machineryRepository;
    private final FarmUserRepository farmUserRepository;

    @Transactional
    public MaintenanceResponse createMaintenance(
            UUID farmId, UUID machineryId, MaintenanceRequest request, User currentUser) {

        Machinery machinery = getAuthorizedMachinery(farmId, machineryId, currentUser);

        MachineryMaintenance maintenance = MachineryMaintenance.builder()
                .machinery(machinery)
                .maintenanceDate(request.maintenanceDate())
                .description(request.description())
                .cost(request.cost())
                .build();

        maintenanceRepository.save(maintenance);

        return MaintenanceResponse.fromEntity(maintenance);
    }

    public List<MaintenanceResponse> getMaintenancesByMachinery(
            UUID farmId, UUID machineryId, User currentUser) {

        getAuthorizedMachinery(farmId, machineryId, currentUser);

        return maintenanceRepository.findAllByMachineryId(machineryId).stream()
                .map(MaintenanceResponse::fromEntity)
                .toList();
    }

    public MaintenanceResponse getMaintenanceById(
            UUID farmId, UUID machineryId, UUID maintenanceId, User currentUser) {

        getAuthorizedMachinery(farmId, machineryId, currentUser);

        MachineryMaintenance maintenance = maintenanceRepository
                .findByIdAndMachineryId(maintenanceId, machineryId)
                .orElseThrow(() -> new NoSuchElementException("Maintenance record not found"));

        return MaintenanceResponse.fromEntity(maintenance);
    }

    @Transactional
    public MaintenanceResponse updateMaintenance(
            UUID farmId, UUID machineryId, UUID maintenanceId,
            MaintenanceRequest request, User currentUser) {

        getAuthorizedMachinery(farmId, machineryId, currentUser);

        MachineryMaintenance maintenance = maintenanceRepository
                .findByIdAndMachineryId(maintenanceId, machineryId)
                .orElseThrow(() -> new NoSuchElementException("Maintenance record not found"));

        maintenance.setMaintenanceDate(request.maintenanceDate());
        maintenance.setDescription(request.description());
        maintenance.setCost(request.cost());

        maintenanceRepository.save(maintenance);

        return MaintenanceResponse.fromEntity(maintenance);
    }

    @Transactional
    public void deleteMaintenance(UUID farmId, UUID machineryId, UUID maintenanceId, User currentUser) {
        getAuthorizedMachinery(farmId, machineryId, currentUser);

        MachineryMaintenance maintenance = maintenanceRepository
                .findByIdAndMachineryId(maintenanceId, machineryId)
                .orElseThrow(() -> new NoSuchElementException("Maintenance record not found"));

        maintenanceRepository.delete(maintenance);
    }

    private Machinery getAuthorizedMachinery(UUID farmId, UUID machineryId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return machineryRepository.findByIdAndFarmId(machineryId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Machinery not found"));
    }
}
