package com.agromanager.inventory;

import com.agromanager.farm.Farm;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryCategory category;

    @Column(length = 150)
    private String supplier;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryUnit unit;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "batch_number", length = 100)
    private String batchNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.stock == null) {
            this.stock = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
