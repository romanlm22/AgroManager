package com.agromanager.dashboard;

import com.agromanager.crop.Crop;
import com.agromanager.crop.CropRepository;
import com.agromanager.crop.CropStatus;
import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.field.FieldRepository;
import com.agromanager.inventory.InventoryItem;
import com.agromanager.inventory.InventoryItemRepository;
import com.agromanager.inventory.InventoryItemResponse;
import com.agromanager.livestock.LivestockSummaryService;
import com.agromanager.machinery.Machinery;
import com.agromanager.machinery.MachineryMaintenance;
import com.agromanager.machinery.MachineryMaintenanceRepository;
import com.agromanager.machinery.MachineryRepository;
import com.agromanager.machinery.MachineryResponse;
import com.agromanager.task.AgriculturalTask;
import com.agromanager.task.AgriculturalTaskRepository;
import com.agromanager.task.TaskResponse;
import com.agromanager.user.User;
import com.agromanager.weather.WeatherClient;
import com.agromanager.weather.WeatherForecast;
import com.agromanager.weather.WeatherProviderException;
import com.agromanager.weather.WeatherResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final BigDecimal LOW_STOCK_THRESHOLD = BigDecimal.TEN;
    private static final int ALERT_WINDOW_DAYS = 7;
    private static final int UPCOMING_TASKS_LIMIT = 5;

    private static final Set<CropStatus> ACTIVE_CROP_STATUSES =
            Set.of(CropStatus.PLANTED, CropStatus.GROWING);

    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;
    private final FieldRepository fieldRepository;
    private final CropRepository cropRepository;
    private final AgriculturalTaskRepository taskRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final MachineryRepository machineryRepository;
    private final MachineryMaintenanceRepository maintenanceRepository;
    private final WeatherClient weatherClient;
    private final LivestockSummaryService livestockSummaryService;

    public DashboardResponse getDashboard(UUID farmId, User currentUser) {
        Farm farm = getAuthorizedFarm(farmId, currentUser);

        long fieldCount = fieldRepository.findAllByFarmId(farmId).size();

        List<Crop> crops = cropRepository.findAllByField_Farm_Id(farmId);
        List<Crop> activeCrops = crops.stream()
                .filter(c -> ACTIVE_CROP_STATUSES.contains(c.getStatus()))
                .toList();
        BigDecimal plantedAreaHa = sumBigDecimal(
                activeCrops.stream().map(Crop::getPlantedAreaHa).toList());

        List<AgriculturalTask> tasks = taskRepository.findAllByField_Farm_Id(farmId);
        BigDecimal totalTaskCost = sumBigDecimal(
                tasks.stream().map(AgriculturalTask::getCost).toList());

        LocalDate today = LocalDate.now();

        List<TaskResponse> upcomingTasks = tasks.stream()
                .filter(t -> !t.getTaskDate().isBefore(today))
                .sorted(Comparator.comparing(AgriculturalTask::getTaskDate))
                .limit(UPCOMING_TASKS_LIMIT)
                .map(TaskResponse::fromEntity)
                .toList();

        List<Machinery> machinery = machineryRepository.findAllByFarmId(farmId);
        LocalDate maintenanceAlertLimit = today.plusDays(ALERT_WINDOW_DAYS);

        List<MachineryResponse> machineryDueForMaintenance = machinery.stream()
                .filter(m -> m.getNextMaintenanceDate() != null)
                .filter(m -> !m.getNextMaintenanceDate().isAfter(maintenanceAlertLimit))
                .map(MachineryResponse::fromEntity)
                .toList();

        List<MachineryMaintenance> maintenances =
                maintenanceRepository.findAllByMachinery_Farm_Id(farmId);
        BigDecimal totalMaintenanceCost = sumBigDecimal(
                maintenances.stream().map(MachineryMaintenance::getCost).toList());

        List<InventoryItem> inventoryItems = inventoryItemRepository.findAllByFarmId(farmId);

        List<InventoryItemResponse> lowStockItems = inventoryItems.stream()
                .filter(i -> i.getStock() != null && i.getStock().compareTo(LOW_STOCK_THRESHOLD) < 0)
                .map(InventoryItemResponse::fromEntity)
                .toList();

        LocalDate expirationAlertLimit = today.plusDays(ALERT_WINDOW_DAYS);
        List<InventoryItemResponse> expiringSoonItems = inventoryItems.stream()
                .filter(i -> i.getExpirationDate() != null)
                .filter(i -> !i.getExpirationDate().isBefore(today))
                .filter(i -> !i.getExpirationDate().isAfter(expirationAlertLimit))
                .map(InventoryItemResponse::fromEntity)
                .toList();

        WeatherResponse weather = resolveWeather(farm);

        return new DashboardResponse(
                farm.getId(),
                farm.getTotalAreaHa(),
                fieldCount,
                activeCrops.size(),
                plantedAreaHa,
                totalTaskCost,
                totalMaintenanceCost,
                lowStockItems,
                expiringSoonItems,
                upcomingTasks,
                machineryDueForMaintenance,
                weather,
                livestockSummaryService.build(farmId)
        );
    }

    /**
     * El clima es un "extra" del dashboard: si el establecimiento no tiene
     * coordenadas cargadas, o el proveedor externo falla, el resto del
     * dashboard debe seguir funcionando igual. Por eso, a diferencia de
     * WeatherService (que sí lanza excepciones), acá devolvemos null en
     * esos casos en lugar de romper toda la respuesta.
     */
    private WeatherResponse resolveWeather(Farm farm) {
        if (farm.getLatitude() == null || farm.getLongitude() == null) {
            return null;
        }

        try {
            WeatherForecast forecast =
                    weatherClient.getForecast(farm.getLatitude(), farm.getLongitude());

            return new WeatherResponse(
                    farm.getId(),
                    farm.getLatitude(),
                    farm.getLongitude(),
                    forecast.current(),
                    forecast.daily()
            );
        } catch (WeatherProviderException e) {
            return null;
        }
    }

    private BigDecimal sumBigDecimal(List<BigDecimal> values) {
        return values.stream()
                .filter(v -> v != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
