package com.agromanager.ai;

import com.agromanager.crop.Crop;
import com.agromanager.crop.CropRepository;
import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmRepository;
import com.agromanager.field.Field;
import com.agromanager.field.FieldRepository;
import com.agromanager.inventory.InventoryItem;
import com.agromanager.inventory.InventoryItemRepository;
import com.agromanager.livestock.AnimalHealthEvent;
import com.agromanager.livestock.AnimalHealthEventRepository;
import com.agromanager.livestock.AnimalRepository;
import com.agromanager.livestock.AnimalStatus;
import com.agromanager.livestock.Herd;
import com.agromanager.livestock.HerdAnimalCount;
import com.agromanager.livestock.HerdRepository;
import com.agromanager.livestock.LivestockSummaryResponse;
import com.agromanager.livestock.LivestockSummaryService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private static final int MAX_HERDS = 50;
    private static final int MAX_HEALTH_EVENTS = 20;

    private final FarmRepository farmRepository;
    private final FieldRepository fieldRepository;
    private final CropRepository cropRepository;
    private final AgriculturalTaskRepository taskRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final MachineryRepository machineryRepository;
    private final MachineryMaintenanceRepository maintenanceRepository;
    private final WeatherClient weatherClient;
    private final HerdRepository herdRepository;
    private final AnimalRepository animalRepository;
    private final AnimalHealthEventRepository healthEventRepository;
    private final LivestockSummaryService livestockSummaryService;

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
        appendLivestock(sb, farmId);
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
                    .append(" | uso: ").append(text(field.getLandUse()))
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
     * La hacienda se resume con cifras agregadas (el detalle animal por animal haría crecer
     * el contexto sin límite): cabezas, rodeos, reproducción, sanidad y producción.
     */
    private void appendLivestock(StringBuilder sb, UUID farmId) {
        LivestockSummaryResponse summary = livestockSummaryService.build(farmId);

        sb.append("GANADERÍA (cabezas = fichas individuales activas + conteo manual de los rodeos sin fichas):\n");

        if (summary.totalHeadCount() == 0 && summary.herdCount() == 0) {
            sb.append("- No hay hacienda cargada.\n\n");
            return;
        }

        sb.append("- cabezas totales: ").append(summary.totalHeadCount())
                .append(" | animales con ficha: ").append(summary.trackedAnimals())
                .append(" | rodeos: ").append(summary.herdCount()).append("\n");

        sb.append("- cabezas por categoría:");
        for (LivestockSummaryResponse.CategoryCount count : summary.headByCategory()) {
            sb.append(" ").append(count.category()).append(" ").append(count.headCount()).append(";");
        }
        sb.append("\n\n");

        appendHerds(sb, farmId);

        sb.append("REPRODUCCIÓN (gestación estimada en 283 días desde el último servicio):\n");
        sb.append("- hembras preñadas: ").append(summary.pregnantCount())
                .append(" | partos estimados en los próximos 30 días o ya vencidos: ")
                .append(summary.dueBirthsTotal()).append("\n");
        for (LivestockSummaryResponse.DueBirth birth : summary.dueBirths()) {
            sb.append("- caravana ").append(birth.tagNumber())
                    .append(" | parto estimado: ").append(birth.estimatedDueDate())
                    .append(" | días restantes: ").append(birth.daysToDue()).append("\n");
        }
        sb.append("\n");

        sb.append("SANIDAD (próximas dosis vencidas o dentro de 7 días: ")
                .append(summary.dueDosesTotal()).append("):\n");
        for (LivestockSummaryResponse.DueDose dose : summary.dueDoses()) {
            sb.append("- ").append(dose.herdTarget() ? "rodeo " : "caravana ").append(dose.targetName())
                    .append(" | producto: ").append(dose.product())
                    .append(" | próxima dosis: ").append(dose.nextDoseDate())
                    .append(dose.overdue() ? " | VENCIDA" : "").append("\n");
        }
        sb.append("- costo sanitario acumulado (ARS): ").append(summary.totalHealthCost()).append("\n\n");

        appendRecentHealthEvents(sb, farmId);

        sb.append("DESEMPEÑO Y PRODUCCIÓN GANADERA:\n");
        sb.append("- ganancia diaria de peso (GDP) promedio, último intervalo de pesaje: ")
                .append(text(summary.averageDailyGainKg())).append(" kg/día (")
                .append(summary.animalsWithGain()).append(" animales con 2 o más pesajes)\n");
        sb.append("- producción del mes en curso:");
        if (summary.currentMonthProduction().isEmpty()) {
            sb.append(" sin registros");
        }
        for (LivestockSummaryResponse.ProductionTotal total : summary.currentMonthProduction()) {
            sb.append(" ").append(total.productType()).append(" ").append(total.quantity())
                    .append(" ").append(total.unit()).append(" (ingreso ARS ").append(total.income()).append(");");
        }
        sb.append("\n- ingresos por producción ganadera, últimos meses (ARS):");
        for (LivestockSummaryResponse.MonthlyIncome income : summary.monthlyIncome()) {
            sb.append(" ").append(income.month()).append(": ").append(income.income()).append(";");
        }
        sb.append("\n\n");
    }

    private void appendHerds(StringBuilder sb, UUID farmId) {
        Map<UUID, Long> trackedByHerd = new HashMap<>();
        for (HerdAnimalCount count : animalRepository.countByHerd(farmId, AnimalStatus.ACTIVO)) {
            trackedByHerd.put(count.getHerdId(), count.getTotal());
        }

        sb.append("RODEOS:\n");
        for (Herd herd : herdRepository.findAllByFarmIdOrderByNameAsc(farmId).stream().limit(MAX_HERDS).toList()) {
            long tracked = trackedByHerd.getOrDefault(herd.getId(), 0L);
            sb.append("- ").append(herd.getName())
                    .append(" | categoría: ").append(text(herd.getCategory()))
                    .append(" | potrero: ").append(herd.getField() != null ? herd.getField().getName() : "—")
                    .append(" | cabezas: ").append(tracked > 0 ? tracked : herd.getManualHeadCount())
                    .append(tracked > 0 ? " (por fichas)" : " (conteo manual)")
                    .append("\n");
        }
        sb.append("\n");
    }

    private void appendRecentHealthEvents(StringBuilder sb, UUID farmId) {
        List<AnimalHealthEvent> events = healthEventRepository
                .findAllByFarmIdOrderByEventDateDescCreatedAtDesc(farmId).stream()
                .limit(MAX_HEALTH_EVENTS)
                .toList();

        sb.append("ÚLTIMOS EVENTOS SANITARIOS (más recientes primero):\n");
        for (AnimalHealthEvent event : events) {
            sb.append("- ").append(text(event.getEventDate()))
                    .append(" | ").append(text(event.getEventType()))
                    .append(" | ").append(event.getAnimal() != null
                            ? "caravana " + event.getAnimal().getTagNumber()
                            : "rodeo " + event.getHerd().getName())
                    .append(" | producto: ").append(event.getProduct())
                    .append(" | dosis: ").append(text(event.getDose()))
                    .append(" | próxima dosis: ").append(text(event.getNextDoseDate()))
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
