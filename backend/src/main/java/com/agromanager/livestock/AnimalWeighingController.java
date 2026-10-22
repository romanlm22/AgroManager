package com.agromanager.livestock;

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
@RequestMapping("/api/farms/{farmId}/animals/{animalId}/weighings")
@RequiredArgsConstructor
public class AnimalWeighingController {

    private final AnimalWeighingService weighingService;

    @PostMapping
    public ResponseEntity<WeighingResponse> createWeighing(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @Valid @RequestBody WeighingRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        WeighingResponse response =
                weighingService.createWeighing(farmId, animalId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<WeighingResponse> getWeighings(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return weighingService.getWeighings(farmId, animalId, userDetails.getUser());
    }

    @GetMapping("/{weighingId}")
    public WeighingResponse getWeighingById(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @PathVariable UUID weighingId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return weighingService.getWeighingById(farmId, animalId, weighingId, userDetails.getUser());
    }

    @PutMapping("/{weighingId}")
    public WeighingResponse updateWeighing(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @PathVariable UUID weighingId,
            @Valid @RequestBody WeighingRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return weighingService.updateWeighing(farmId, animalId, weighingId, request, userDetails.getUser());
    }

    @DeleteMapping("/{weighingId}")
    public ResponseEntity<Void> deleteWeighing(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @PathVariable UUID weighingId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        weighingService.deleteWeighing(farmId, animalId, weighingId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
