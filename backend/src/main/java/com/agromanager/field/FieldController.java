package com.agromanager.field;

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
@RequestMapping("/api/farms/{farmId}/fields")
@RequiredArgsConstructor
public class FieldController {

    private final FieldService fieldService;

    @PostMapping
    public ResponseEntity<FieldResponse> createField(
            @PathVariable UUID farmId,
            @Valid @RequestBody FieldRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        FieldResponse response = fieldService.createField(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<FieldResponse> getFields(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return fieldService.getFieldsByFarm(farmId, userDetails.getUser());
    }

    @GetMapping("/{fieldId}")
    public FieldResponse getFieldById(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return fieldService.getFieldById(farmId, fieldId, userDetails.getUser());
    }

    @PutMapping("/{fieldId}")
    public FieldResponse updateField(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @Valid @RequestBody FieldRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return fieldService.updateField(farmId, fieldId, request, userDetails.getUser());
    }

    @DeleteMapping("/{fieldId}")
    public ResponseEntity<Void> deleteField(
            @PathVariable UUID farmId,
            @PathVariable UUID fieldId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        fieldService.deleteField(farmId, fieldId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}