package com.agromanager.machinery;

import com.agromanager.auth.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/farms/{farmId}/machinery/{machineryId}/maintenances")
@RequiredArgsConstructor
public class MachineryMaintenanceController {

    private final MachineryMaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceResponse> createMaintenance(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @Valid @RequestBody MaintenanceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        MaintenanceResponse response =
                maintenanceService.createMaintenance(farmId, machineryId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<MaintenanceResponse> getMaintenances(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return maintenanceService.getMaintenancesByMachinery(farmId, machineryId, userDetails.getUser());
    }

    @GetMapping("/{maintenanceId}")
    public MaintenanceResponse getMaintenanceById(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @PathVariable UUID maintenanceId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return maintenanceService.getMaintenanceById(farmId, machineryId, maintenanceId, userDetails.getUser());
    }

    @PutMapping("/{maintenanceId}")
    public MaintenanceResponse updateMaintenance(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @PathVariable UUID maintenanceId,
            @Valid @RequestBody MaintenanceRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return maintenanceService.updateMaintenance(
                farmId, machineryId, maintenanceId, request, userDetails.getUser());
    }

    @DeleteMapping("/{maintenanceId}")
    public ResponseEntity<Void> deleteMaintenance(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @PathVariable UUID maintenanceId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        maintenanceService.deleteMaintenance(farmId, machineryId, maintenanceId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
