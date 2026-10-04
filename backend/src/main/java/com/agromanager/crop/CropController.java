package com.agromanager.crop;

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
@RequestMapping("/api/farms/{farmId}/fields/{fieldId}/crops")
@RequiredArgsConstructor
public class CropController {

    private final CropService cropService;

    @PostMapping
    public ResponseEntity<CropResponse> createCrop(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @Valid @RequestBody CropRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        CropResponse response = cropService.createCrop(farmId, fieldId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<CropResponse> getCrops(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return cropService.getCropsByField(farmId, fieldId, userDetails.getUser());
    }

    @GetMapping("/{cropId}")
    public CropResponse getCropById(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @PathVariable UUID cropId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return cropService.getCropById(farmId, fieldId, cropId, userDetails.getUser());
    }

    @PutMapping("/{cropId}")
    public CropResponse updateCrop(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @PathVariable UUID cropId,
            @Valid @RequestBody CropRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return cropService.updateCrop(farmId, fieldId, cropId, request, userDetails.getUser());
    }

    @DeleteMapping("/{cropId}")
    public ResponseEntity<Void> deleteCrop(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @PathVariable UUID cropId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        cropService.deleteCrop(farmId, fieldId, cropId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}