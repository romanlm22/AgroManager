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
@RequestMapping("/api/farms/{farmId}/health-events")
@RequiredArgsConstructor
public class HealthEventController {

    private final HealthEventService healthEventService;

    @PostMapping
    public ResponseEntity<HealthEventResponse> createEvent(
            @PathVariable UUID farmId,
            @Valid @RequestBody HealthEventRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        HealthEventResponse response = healthEventService.createEvent(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<HealthEventResponse> getEvents(
            @PathVariable UUID farmId,
            @RequestParam(required = false) UUID animalId,
            @RequestParam(required = false) UUID herdId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return healthEventService.getEvents(farmId, animalId, herdId, userDetails.getUser());
    }

    @GetMapping("/{eventId}")
    public HealthEventResponse getEventById(
            @PathVariable UUID farmId,
            @PathVariable UUID eventId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return healthEventService.getEventById(farmId, eventId, userDetails.getUser());
    }

    @PutMapping("/{eventId}")
    public HealthEventResponse updateEvent(
            @PathVariable UUID farmId,
            @PathVariable UUID eventId,
            @Valid @RequestBody HealthEventRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return healthEventService.updateEvent(farmId, eventId, request, userDetails.getUser());
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID farmId,
            @PathVariable UUID eventId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        healthEventService.deleteEvent(farmId, eventId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
