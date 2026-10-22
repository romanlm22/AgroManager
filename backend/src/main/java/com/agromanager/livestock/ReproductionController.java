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
@RequestMapping("/api/farms/{farmId}")
@RequiredArgsConstructor
public class ReproductionController {

    private final ReproductionService reproductionService;

    @PostMapping("/reproduction-events")
    public ResponseEntity<ReproductionEventResponse> createEvent(
            @PathVariable UUID farmId,
            @Valid @RequestBody ReproductionEventRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        ReproductionEventResponse response =
                reproductionService.createEvent(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/reproduction-events")
    public List<ReproductionEventResponse> getEvents(
            @PathVariable UUID farmId,
            @RequestParam(required = false) UUID animalId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return reproductionService.getEvents(farmId, animalId, userDetails.getUser());
    }

    @GetMapping("/reproduction-events/{eventId}")
    public ReproductionEventResponse getEventById(
            @PathVariable UUID farmId,
            @PathVariable UUID eventId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return reproductionService.getEventById(farmId, eventId, userDetails.getUser());
    }

    @PutMapping("/reproduction-events/{eventId}")
    public ReproductionEventResponse updateEvent(
            @PathVariable UUID farmId,
            @PathVariable UUID eventId,
            @Valid @RequestBody ReproductionEventRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return reproductionService.updateEvent(farmId, eventId, request, userDetails.getUser());
    }

    @DeleteMapping("/reproduction-events/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID farmId,
            @PathVariable UUID eventId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        reproductionService.deleteEvent(farmId, eventId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reproduction-status")
    public List<ReproductiveStatusResponse> getReproductiveStatus(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return reproductionService.getReproductiveStatus(farmId, userDetails.getUser());
    }
}
