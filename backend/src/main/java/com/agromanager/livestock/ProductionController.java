package com.agromanager.livestock;

import com.agromanager.auth.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/farms/{farmId}/productions")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @PostMapping
    public ResponseEntity<ProductionResponse> createProduction(
            @PathVariable UUID farmId,
            @Valid @RequestBody ProductionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        ProductionResponse response = productionService.createProduction(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<ProductionResponse> getProductions(
            @PathVariable UUID farmId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return productionService.getProductions(farmId, startDate, endDate, userDetails.getUser());
    }

    @GetMapping("/{productionId}")
    public ProductionResponse getProductionById(
            @PathVariable UUID farmId,
            @PathVariable UUID productionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return productionService.getProductionById(farmId, productionId, userDetails.getUser());
    }

    @PutMapping("/{productionId}")
    public ProductionResponse updateProduction(
            @PathVariable UUID farmId,
            @PathVariable UUID productionId,
            @Valid @RequestBody ProductionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return productionService.updateProduction(farmId, productionId, request, userDetails.getUser());
    }

    @DeleteMapping("/{productionId}")
    public ResponseEntity<Void> deleteProduction(
            @PathVariable UUID farmId,
            @PathVariable UUID productionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        productionService.deleteProduction(farmId, productionId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
