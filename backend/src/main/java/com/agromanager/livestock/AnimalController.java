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
@RequestMapping("/api/farms/{farmId}/animals")
@RequiredArgsConstructor
public class AnimalController {

    private final AnimalService animalService;

    @PostMapping
    public ResponseEntity<AnimalResponse> createAnimal(
            @PathVariable UUID farmId,
            @Valid @RequestBody AnimalRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        AnimalResponse response = animalService.createAnimal(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<AnimalResponse>> createAnimalsBulk(
            @PathVariable UUID farmId,
            @Valid @RequestBody BulkAnimalRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        List<AnimalResponse> response = animalService.createAnimalsBulk(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<AnimalResponse> getAnimals(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return animalService.getAnimalsByFarm(farmId, userDetails.getUser());
    }

    @GetMapping("/{animalId}")
    public AnimalResponse getAnimalById(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return animalService.getAnimalById(farmId, animalId, userDetails.getUser());
    }

    @PutMapping("/{animalId}")
    public AnimalResponse updateAnimal(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @Valid @RequestBody AnimalRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return animalService.updateAnimal(farmId, animalId, request, userDetails.getUser());
    }

    @PostMapping("/{animalId}/move")
    public AnimalResponse moveAnimal(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @Valid @RequestBody MoveRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return animalService.moveAnimal(farmId, animalId, request, userDetails.getUser());
    }

    @PostMapping("/{animalId}/retire")
    public AnimalResponse retireAnimal(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @Valid @RequestBody RetireRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return animalService.retireAnimal(farmId, animalId, request, userDetails.getUser());
    }

    @GetMapping("/{animalId}/movements")
    public List<AnimalMovementResponse> getMovements(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return animalService.getMovements(farmId, animalId, userDetails.getUser());
    }

    @DeleteMapping("/{animalId}")
    public ResponseEntity<Void> deleteAnimal(
            @PathVariable UUID farmId,
            @PathVariable UUID animalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        animalService.deleteAnimal(farmId, animalId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
