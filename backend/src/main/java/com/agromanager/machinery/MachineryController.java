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
@RequestMapping("/api/farms/{farmId}/machinery")
@RequiredArgsConstructor
public class MachineryController {

    private final MachineryService machineryService;

    @PostMapping
    public ResponseEntity<MachineryResponse> createMachinery(
            @PathVariable UUID farmId,
            @Valid @RequestBody MachineryRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        MachineryResponse response = machineryService.createMachinery(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<MachineryResponse> getMachinery(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return machineryService.getMachineryByFarm(farmId, userDetails.getUser());
    }

    @GetMapping("/{machineryId}")
    public MachineryResponse getMachineryById(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return machineryService.getMachineryById(farmId, machineryId, userDetails.getUser());
    }

    @PutMapping("/{machineryId}")
    public MachineryResponse updateMachinery(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @Valid @RequestBody MachineryRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return machineryService.updateMachinery(farmId, machineryId, request, userDetails.getUser());
    }

    @DeleteMapping("/{machineryId}")
    public ResponseEntity<Void> deleteMachinery(
            @PathVariable UUID farmId,
            @PathVariable UUID machineryId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        machineryService.deleteMachinery(farmId, machineryId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
