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
@RequestMapping("/api/farms/{farmId}/herds")
@RequiredArgsConstructor
public class HerdController {

    private final HerdService herdService;

    @PostMapping
    public ResponseEntity<HerdResponse> createHerd(
            @PathVariable UUID farmId,
            @Valid @RequestBody HerdRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        HerdResponse response = herdService.createHerd(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<HerdResponse> getHerds(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return herdService.getHerdsByFarm(farmId, userDetails.getUser());
    }

    @GetMapping("/{herdId}")
    public HerdResponse getHerdById(
            @PathVariable UUID farmId,
            @PathVariable UUID herdId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return herdService.getHerdById(farmId, herdId, userDetails.getUser());
    }

    @PutMapping("/{herdId}")
    public HerdResponse updateHerd(
            @PathVariable UUID farmId,
            @PathVariable UUID herdId,
            @Valid @RequestBody HerdRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return herdService.updateHerd(farmId, herdId, request, userDetails.getUser());
    }

    @PostMapping("/{herdId}/move")
    public HerdResponse moveHerd(
            @PathVariable UUID farmId,
            @PathVariable UUID herdId,
            @Valid @RequestBody MoveRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return herdService.moveHerd(farmId, herdId, request, userDetails.getUser());
    }

    @DeleteMapping("/{herdId}")
    public ResponseEntity<Void> deleteHerd(
            @PathVariable UUID farmId,
            @PathVariable UUID herdId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        herdService.deleteHerd(farmId, herdId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
