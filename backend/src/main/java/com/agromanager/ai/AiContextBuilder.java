package com.agromanager.ai;

import com.agromanager.crop.Crop;
import com.agromanager.crop.CropRepository;
import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmRepository;
import com.agromanager.field.Field;
import com.agromanager.field.FieldRepository;
import com.agromanager.inventory.InventoryItem;
import com.agromanager.inventory.InventoryItemRepository;
import com.agromanager.machinery.Machinery;
import com.agromanager.machinery.MachineryMaintenance;
import com.agromanager.machinery.MachineryMaintenanceRepository;
import com.agromanager.machinery.MachineryRepository;
import com.agromanager.task.AgriculturalTask;
import com.agromanager.task.AgriculturalTaskRepository;
import com.agromanager.weather.CurrentWeatherResponse;
import com.agromanager.weather.DailyForecastResponse;
import com.agromanager.weather.WeatherClient;
import com.agromanager.weather.WeatherForecast;
import com.agromanager.weather.WeatherProviderException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

/**
 * Arma el texto con el estado actual del establecimiento que se le da al
 * modelo como contexto. No incluye datos de personas (emails, responsables):
 * solo datos agronómicos.
 *
 * Cada lista tiene un tope para que el contexto no crezca sin límite.
 */
@Component
@RequiredArgsConstructor
public class AiContextBuilder {

    private static final int MAX_CROPS = 60;
    private static final int MAX_TASKS = 60;
    private static final int MAX_INVENTORY_ITEMS = 100;
    private static final int MAX_MAINTENANCES = 30;

    private final FarmRepository farmRepository;
    private final FieldRepository fieldRepository;
    private final CropRepository cropRepository;
    private final AgriculturalTaskRepository taskRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final MachineryRepository machineryRepository;
    private final MachineryMaintenanceRepository maintenanceRepository;
    private final WeatherClient weatherClient;

    @Transactional(readOnly = true)
    public String build(UUID farmId) {
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new NoSuchElementException("Farm not found"));

        StringBuilder sb = new StringBuilder();

        sb.append("FECHA DE HOY: ").append(LocalDate.now()).append("\n\n");

        sb.append("ESTABLECIMIENTO: ").append(farm.getName())
                .append(" | ubicación: ").append(text(farm.getLocation()))
                .append(" | superficie total (ha): ").append(text(farm.getTotalAreaHa()))
                .append("\n\n");

        appendFields(sb, farmId);
        appendCrops(sb, farmId);
        appendTasks(sb, farmId);
        appendInventory(sb, farmId);
        appendMachinery(sb, farmId);
        appendWeather(sb, farm);

        return sb.toString();
    }

    private void appendFields(StringBuilder sb, UUID farmId) {
        List<Field> fields = fieldRepository.findAllByFarmId(farmId);

        sb.append("LOTES (").append(fields.size()).append("):\n");
        for (Field field : fields) {
            sb.append("- ").append(field.getName())
                    .append(" | ha: ").append(text(field.getAreaHa()))
                    .append(" | suelo: ").append(text(field.getSoilType()))
                    .append(" | estado: ").append(text(field.getStatus()))
                    .append("\n");
        }
        sb.append("\n");
    }

    private void appendCrops(StringBuilder sb, UUID farmId) {
        List<Crop> crops = cropRepository.findAllByField_Farm_Id(farmId).stream()
                .sorted(Comparator.comparing(Crop::getPlantingDate).reversed())
                .limit(MAX_CROPS)
                .toList();

        sb.append("CULTIVOS (más recientes primero; estados: PLANTED sembrado, GROWING en crecimiento,"
                + " HARVESTED cosechado, LOST perdido):\n");
        for (Crop crop : crops) {
            sb.append("- ").append(crop.getCropType().getName())
                    .append(" | lote: ").append(crop.getField().getName())
                    .append(" | siembra: ").append(text(crop.getPlantingDate()))
                    .append(" | cosecha estimada: ").append(text(crop.getEstimatedHarvestDate()))
                    .append(" | cosecha real: ").append(text(crop.getActualHarvestDate()))
                    .append(" | ha sembradas: ").append(text(crop.getPlantedAreaHa()))
                    .append(" | rinde kg/ha: ").append(text(crop.getYieldKgHa()))
                    .append(" | estado: ").append(text(crop.getStatus()))
                    .append("\n");
        }
        sb.append("\n");
    }

    private void appendTasks(StringBuilder sb, UUID farmId) {
        List<AgriculturalTask> tasks = taskRepository.findAllByField_Farm_Id(farmId).stream()
                .sorted(Comparator.comparing(AgriculturalTask::getTaskDate).reversed())
                .limit(MAX_TASKS)
                .toList();

        sb.append("LABORES (más recientes primero, costo en ARS):\n");
        for (AgriculturalTask task : tasks) {
            sb.append("- ").append(text(task.getTaskDate()))
                    .append(" | ").append(text(task.getTaskType()))
                    .append(" | lote: ").append(task.getField().getName())
                    .append(" | cultivo: ")
                    .append(task.getCrop() != null ? task.getCrop().getCropType().getName() : "—")
                    .append(" | estado: ").append(text(task.getStatus()))
                    .append(" | costo: ").append(text(task.getCost()))
                    .append(" | notas: ").append(text(task.getNotes()))
                    .append("\n");
        }
        sb.append("\n");
    }

    private void appendInventory(StringBuilder sb, UUID farmId) {
        List<InventoryItem> items = inventoryItemRepository.findAllByFarmId(farmId).stream()
                .limit(MAX_INVENTORY_ITEMS)
                .toList();

        sb.append("INVENTARIO (stock bajo = menos de 10 unidades; precio en ARS por unidad):\n");
        for (InventoryItem item : items) {
            sb.append("- ").append(item.getName())
                    .append(" | categoría: ").append(text(item.getCategory()))
                    .append(" | stock: ").append(text(item.getStock()))
                    .append(" ").append(text(item.getUnit()))
                    .append(" | precio: ").append(text(item.getPrice()))
                    .append(" | vence: ").append(text(item.getExpirationDate()))
                    .append(" | proveedor: ").append(text(item.getSupplier()))
                    .append("\n");
        }
        sb.append("\n");
    }

    private void appendMachinery(StringBuilder sb, UUID farmId) {
        List<Machinery> machines = machineryRepository.findAllByFarmId(farmId);

        sb.append("MAQUINARIA:\n");
        for (Machinery machine : machines) {
            sb.append("- ").append(machine.getName())
                    .append(" | tipo: ").append(text(machine.getMachineryType()))
                    .append(" | marca/modelo: ").append(text(machine.getBrand()))
                    .append(" ").append(text(machine.getModel()))
                    .append(" | año: ").append(text(machine.getYear()))
                    .append(" | horas: ").append(text(machine.getHoursUsed()))
                    .append(" | estado: ").append(text(machine.getStatus()))
                    .append(" | próximo mantenimiento: ").append(text(machine.getNextMaintenanceDate()))
                    .append("\n");
        }
        sb.append("\n");

        List<MachineryMaintenance> maintenances =
                maintenanceRepository.findAllByMachinery_Farm_Id(farmId).stream()
                        .sorted(Comparator.comparing(MachineryMaintenance::getMaintenanceDate).reversed())
                        .limit(MAX_MAINTENANCES)
                        .toList();

        sb.append("MANTENIMIENTOS REALIZADOS (más recientes primero, costo en ARS):\n");
        for (MachineryMaintenance maintenance : maintenances) {
            sb.append("- ").append(text(maintenance.getMaintenanceDate()))
                    .append(" | máquina: ").append(maintenance.getMachinery().getName())
                    .append(" | descripción: ").append(text(maintenance.getDescription()))
                    .append(" | costo: ").append(text(maintenance.getCost()))
                    .append("\n");
        }
        sb.append("\n");
    }

    /**
     * El clima es un extra: si el establecimiento no tiene coordenadas o el
     * proveedor falla, el asistente sigue funcionando sin esa sección.
     */
    private void appendWeather(StringBuilder sb, Farm farm) {
        if (farm.getLatitude() == null || farm.getLongitude() == null) {
            sb.append("CLIMA: no disponible (el establecimiento no tiene coordenadas cargadas).\n");
            return;
        }

        try {
            WeatherForecast forecast =
                    weatherClient.getForecast(farm.getLatitude(), farm.getLongitude());
            CurrentWeatherResponse current = forecast.current();

            sb.append("CLIMA ACTUAL: ").append(text(current.temperatureC())).append(" °C, humedad ")
                    .append(text(current.humidityPercent())).append(" %, lluvia ")
                    .append(text(current.precipitationMm())).append(" mm, viento ")
                    .append(text(current.windSpeedKmh())).append(" km/h\n");

            sb.append("PRONÓSTICO 7 DÍAS:\n");
            for (DailyForecastResponse day : forecast.daily()) {
                sb.append("- ").append(day.date())
                        .append(" | mín ").append(text(day.tempMinC()))
                        .append(" °C | máx ").append(text(day.tempMaxC()))
                        .append(" °C | lluvia ").append(text(day.precipitationSumMm()))
                        .append(" mm | prob. lluvia ").append(text(day.precipitationProbabilityPercent()))
                        .append(" %\n");
            }
        } catch (WeatherProviderException e) {
            sb.append("CLIMA: no disponible en este momento (falló el proveedor).\n");
        }
    }

    private String text(Object value) {
        return value == null ? "—" : value.toString();
    }
}
