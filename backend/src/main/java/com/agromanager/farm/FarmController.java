package com.agromanager.farm;

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
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    @PostMapping
    public ResponseEntity<FarmResponse> createFarm(
            @Valid @RequestBody FarmRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        FarmResponse response = farmService.createFarm(request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<FarmResponse> getMyFarms(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return farmService.getMyFarms(userDetails.getUser());
    }

    @GetMapping("/{id}")
    public FarmResponse getFarmById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return farmService.getFarmById(id, userDetails.getUser());
    }

    @PutMapping("/{id}")
    public FarmResponse updateFarm(
            @PathVariable UUID id,
            @Valid @RequestBody FarmRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return farmService.updateFarm(id, request, userDetails.getUser());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFarm(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        farmService.deleteFarm(id, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}