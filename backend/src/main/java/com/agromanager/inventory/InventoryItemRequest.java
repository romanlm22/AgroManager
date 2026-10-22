package com.agromanager.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryItemRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must be at most 150 characters")
        String name,

        @NotNull(message = "Category is required")
        InventoryCategory category,

        @Size(max = 150, message = "Supplier must be at most 150 characters")
        String supplier,

        @DecimalMin(value = "0.0", inclusive = true, message = "Stock must be zero or positive")
        BigDecimal stock,

        @NotNull(message = "Unit is required")
        InventoryUnit unit,

        @DecimalMin(value = "0.0", inclusive = true, message = "Price must be zero or positive")
        BigDecimal price,

        LocalDate expirationDate,

        @Size(max = 100, message = "Batch number must be at most 100 characters")
        String batchNumber
) {}
