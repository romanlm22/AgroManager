package com.agromanager.dashboard;

import com.agromanager.inventory.InventoryItemResponse;
import com.agromanager.livestock.LivestockSummaryResponse;
import com.agromanager.machinery.MachineryResponse;
import com.agromanager.task.TaskResponse;
import com.agromanager.weather.WeatherResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record DashboardResponse(
        UUID farmId,
        BigDecimal totalAreaHa,
        long fieldCount,
        long activeCropsCount,
        BigDecimal plantedAreaHa,
        BigDecimal totalTaskCost,
        BigDecimal totalMaintenanceCost,
        List<InventoryItemResponse> lowStockItems,
        List<InventoryItemResponse> expiringSoonItems,
        List<TaskResponse> upcomingTasks,
        List<MachineryResponse> machineryDueForMaintenance,
        WeatherResponse weather,
        LivestockSummaryResponse livestock
) {}
