package com.agromanager.inventory;

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
@RequestMapping("/api/farms/{farmId}/inventory")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @PostMapping
    public ResponseEntity<InventoryItemResponse> createItem(
            @PathVariable UUID farmId,
            @Valid @RequestBody InventoryItemRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        InventoryItemResponse response =
                inventoryItemService.createItem(farmId, request, userDetails.getUser());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<InventoryItemResponse> getItems(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return inventoryItemService.getItemsByFarm(farmId, userDetails.getUser());
    }

    @GetMapping("/{itemId}")
    public InventoryItemResponse getItemById(
            @PathVariable UUID farmId,
            @PathVariable UUID itemId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return inventoryItemService.getItemById(farmId, itemId, userDetails.getUser());
    }

    @PutMapping("/{itemId}")
    public InventoryItemResponse updateItem(
            @PathVariable UUID farmId,
            @PathVariable UUID itemId,
            @Valid @RequestBody InventoryItemRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        return inventoryItemService.updateItem(farmId, itemId, request, userDetails.getUser());
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable UUID farmId,
            @PathVariable UUID itemId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        inventoryItemService.deleteItem(farmId, itemId, userDetails.getUser());
        return ResponseEntity.noContent().build();
    }
}
