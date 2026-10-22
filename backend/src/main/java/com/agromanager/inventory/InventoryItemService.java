package com.agromanager.inventory;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    @Transactional
    public InventoryItemResponse createItem(UUID farmId, InventoryItemRequest request, User currentUser) {
        Farm farm = getAuthorizedFarm(farmId, currentUser);

        InventoryItem item = InventoryItem.builder()
                .farm(farm)
                .name(request.name())
                .category(request.category())
                .supplier(request.supplier())
                .stock(request.stock())
                .unit(request.unit())
                .price(request.price())
                .expirationDate(request.expirationDate())
                .batchNumber(request.batchNumber())
                .build();

        inventoryItemRepository.save(item);

        return InventoryItemResponse.fromEntity(item);
    }

    public List<InventoryItemResponse> getItemsByFarm(UUID farmId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        return inventoryItemRepository.findAllByFarmId(farmId).stream()
                .map(InventoryItemResponse::fromEntity)
                .toList();
    }

    public InventoryItemResponse getItemById(UUID farmId, UUID itemId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        InventoryItem item = inventoryItemRepository.findByIdAndFarmId(itemId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Inventory item not found"));

        return InventoryItemResponse.fromEntity(item);
    }

    @Transactional
    public InventoryItemResponse updateItem(UUID farmId, UUID itemId, InventoryItemRequest request, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        InventoryItem item = inventoryItemRepository.findByIdAndFarmId(itemId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Inventory item not found"));

        item.setName(request.name());
        item.setCategory(request.category());
        item.setSupplier(request.supplier());
        if (request.stock() != null) {
            item.setStock(request.stock());
        }
        item.setUnit(request.unit());
        item.setPrice(request.price());
        item.setExpirationDate(request.expirationDate());
        item.setBatchNumber(request.batchNumber());

        inventoryItemRepository.save(item);

        return InventoryItemResponse.fromEntity(item);
    }

    @Transactional
    public void deleteItem(UUID farmId, UUID itemId, User currentUser) {
        getAuthorizedFarm(farmId, currentUser);

        InventoryItem item = inventoryItemRepository.findByIdAndFarmId(itemId, farmId)
                .orElseThrow(() -> new NoSuchElementException("Inventory item not found"));

        inventoryItemRepository.delete(item);
    }

    private Farm getAuthorizedFarm(UUID farmId, User currentUser) {
        boolean hasAccess = farmUserRepository.existsByFarmIdAndUserId(farmId, currentUser.getId());

        if (!hasAccess) {
            throw new FarmAccessDeniedException("You do not have access to this farm");
        }

        return farmRepository.findById(farmId)
                .orElseThrow(() -> new NoSuchElementException("Farm not found"));
    }
}
