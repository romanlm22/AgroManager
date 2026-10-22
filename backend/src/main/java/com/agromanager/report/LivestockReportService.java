package com.agromanager.report;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.livestock.AnimalResponse;
import com.agromanager.livestock.AnimalService;
import com.agromanager.livestock.AnimalStatus;
import com.agromanager.livestock.HealthEventResponse;
import com.agromanager.livestock.HealthEventService;
import com.agromanager.livestock.HerdResponse;
import com.agromanager.livestock.HerdService;
import com.agromanager.livestock.LivestockProductType;
import com.agromanager.livestock.LivestockSummaryResponse;
import com.agromanager.livestock.LivestockSummaryService;
import com.agromanager.livestock.ProductionResponse;
import com.agromanager.livestock.ProductionService;
import com.agromanager.livestock.ProductionUnit;
import com.agromanager.user.User;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

import static com.agromanager.report.ReportPdfUtils.*;

/**
 * Reportes PDF de ganadería: stock, sanidad y producción. Los datos se piden a los
 * servicios del módulo livestock, que ya verifican el acceso al establecimiento.
 */
@Service
@RequiredArgsConstructor
public class LivestockReportService {

    private final HerdService herdService;
    private final AnimalService animalService;
    private final HealthEventService healthEventService;
    private final ProductionService productionService;
    private final LivestockSummaryService summaryService;
    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    // ---------- Stock ----------

    public byte[] generateStockReportPdf(UUID farmId, User currentUser) {
        Farm farm = getAuthorizedFarm(farmId, currentUser);

        List<HerdResponse> herds = herdService.getHerdsByFarm(farmId, currentUser);
        List<AnimalResponse> animals = animalService.getAnimalsByFarm(farmId, currentUser).stream()
                .filter(animal -> animal.status() == AnimalStatus.ACTIVO)
                .toList();
        LivestockSummaryResponse summary = summaryService.build(farmId);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = newLandscapeDocument();
            PdfWriter.getInstance(document, out);
            document.open();

            addTitle(document, "Reporte de Stock Ganadero - " + farm.getName(),
                    "Estado actual  |  Generado: " + LocalDate.now());

            Paragraph totals = new Paragraph(
                    "Cabezas totales: " + summary.totalHeadCount()
                            + "   |   Animales con ficha: " + summary.trackedAnimals()
                            + "   |   Rodeos: " + summary.herdCount(),
                    BOLD_FONT);
            totals.setSpacingAfter(10);
            document.add(totals);

            addSectionTitle(document, "Cabezas por categoria");
            PdfPTable categories = new PdfPTable(2);
            categories.setWidthPercentage(40);
            categories.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_LEFT);
            addHeaderCell(categories, "Categoria");
            addHeaderCell(categories, "Cabezas");
            for (LivestockSummaryResponse.CategoryCount count : summary.headByCategory()) {
                addCell(categories, label(count.category()));
                addCell(categories, String.valueOf(count.headCount()));
            }
            document.add(categories);

            addSectionTitle(document, "Rodeos");
            PdfPTable herdTable = new PdfPTable(5);
            herdTable.setWidthPercentage(100);
            herdTable.setWidths(new float[]{26, 18, 24, 12, 20});
            addHeaderCell(herdTable, "Rodeo");
            addHeaderCell(herdTable, "Categoria");
            addHeaderCell(herdTable, "Potrero");
            addHeaderCell(herdTable, "Cabezas");
            addHeaderCell(herdTable, "Conteo");
            for (HerdResponse herd : herds) {
                addCell(herdTable, herd.name());
                addCell(herdTable, label(herd.category()));
                addCell(herdTable, orDash(herd.fieldName()));
                addCell(herdTable, String.valueOf(herd.headCount()));
                addCell(herdTable, label(herd.headCountMode()));
            }
            document.add(herdTable);

            addSectionTitle(document, "Animales con ficha (activos)");
            PdfPTable animalTable = new PdfPTable(8);
            animalTable.setWidthPercentage(100);
            animalTable.setWidths(new float[]{14, 9, 13, 14, 12, 16, 16, 10});
            addHeaderCell(animalTable, "Caravana");
            addHeaderCell(animalTable, "Sexo");
            addHeaderCell(animalTable, "Categoria");
            addHeaderCell(animalTable, "Raza");
            addHeaderCell(animalTable, "Nacimiento");
            addHeaderCell(animalTable, "Rodeo");
            addHeaderCell(animalTable, "Potrero");
            addHeaderCell(animalTable, "Peso (kg)");
            for (AnimalResponse animal : animals) {
                addCell(animalTable, animal.tagNumber());
                addCell(animalTable, label(animal.sex()));
                addCell(animalTable, label(animal.category()));
                addCell(animalTable, orDash(animal.breed()));
                addCell(animalTable, animal.birthDate() != null ? animal.birthDate().toString() : "-");
                addCell(animalTable, orDash(animal.herdName()));
                addCell(animalTable, orDash(animal.fieldName()));
                addCell(animalTable, animal.currentWeightKg() != null
                        ? animal.currentWeightKg().toPlainString() : "-");
            }
            document.add(animalTable);

            document.close();

            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ReportGenerationException("Unable to generate the PDF report", e);
        }
    }

    // ---------- Sanidad ----------

    public byte[] generateHealthReportPdf(
            UUID farmId, LocalDate startDate, LocalDate endDate, User currentUser) {

        Farm farm = getAuthorizedFarm(farmId, currentUser);

        List<HealthEventResponse> events = healthEventService.getEvents(farmId, null, null, currentUser).stream()
                .filter(event -> startDate == null || !event.eventDate().isBefore(startDate))
                .filter(event -> endDate == null || !event.eventDate().isAfter(endDate))
                .sorted(Comparator.comparing(HealthEventResponse::eventDate))
                .toList();

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = newLandscapeDocument();
            PdfWriter.getInstance(document, out);
            document.open();

            addTitle(document, "Reporte Sanitario - " + farm.getName(),
                    buildRangeText("Todos los eventos sanitarios", "Eventos", startDate, endDate)
                            + "  |  Generado: " + LocalDate.now());

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{11, 13, 8, 17, 18, 12, 12, 9});
            addHeaderCell(table, "Fecha");
            addHeaderCell(table, "Tipo");
            addHeaderCell(table, "Destino");
            addHeaderCell(table, "Animal / Rodeo");
            addHeaderCell(table, "Producto");
            addHeaderCell(table, "Dosis");
            addHeaderCell(table, "Prox. dosis");
            addHeaderCell(table, "Costo");

            BigDecimal totalCost = BigDecimal.ZERO;
            LocalDate today = LocalDate.now();
            int overdue = 0;

            for (HealthEventResponse event : events) {
                boolean herdTarget = event.animalId() == null;
                addCell(table, event.eventDate().toString());
                addCell(table, label(event.eventType()));
                addCell(table, herdTarget ? "Rodeo" : "Animal");
                addCell(table, herdTarget ? event.herdName() : event.animalTagNumber());
                addCell(table, event.product());
                addCell(table, orDash(event.dose()));
                addCell(table, event.nextDoseDate() != null && event.nextDosePending()
                        ? event.nextDoseDate().toString() : "-");
                addCell(table, event.cost() != null ? "$ " + event.cost().toPlainString() : "-");

                if (event.cost() != null) {
                    totalCost = totalCost.add(event.cost());
                }
                if (event.nextDosePending() && event.nextDoseDate() != null
                        && event.nextDoseDate().isBefore(today)) {
                    overdue++;
                }
            }

            document.add(table);

            Paragraph summary = new Paragraph(
                    "Cantidad de eventos: " + events.size()
                            + "   |   Proximas dosis vencidas: " + overdue,
                    SMALL_FONT);
            summary.setSpacingBefore(10);
            document.add(summary);
            document.add(new Paragraph("Costo sanitario total: $ " + totalCost.toPlainString(), BOLD_FONT));

            document.close();

            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ReportGenerationException("Unable to generate the PDF report", e);
        }
    }

    // ---------- Producción ganadera ----------

    private record TotalKey(LivestockProductType type, ProductionUnit unit) {}

    public byte[] generateProductionReportPdf(
            UUID farmId, LocalDate startDate, LocalDate endDate, User currentUser) {

        Farm farm = getAuthorizedFarm(farmId, currentUser);

        List<ProductionResponse> productions =
                productionService.getProductions(farmId, startDate, endDate, currentUser).stream()
                        .sorted(Comparator.comparing(ProductionResponse::productionDate))
                        .toList();

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = newLandscapeDocument();
            PdfWriter.getInstance(document, out);
            document.open();

            addTitle(document, "Reporte de Produccion Ganadera - " + farm.getName(),
                    buildRangeText("Toda la produccion registrada", "Produccion", startDate, endDate)
                            + "  |  Generado: " + LocalDate.now());

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{12, 14, 12, 8, 22, 16, 16});
            addHeaderCell(table, "Fecha");
            addHeaderCell(table, "Producto");
            addHeaderCell(table, "Cantidad");
            addHeaderCell(table, "Unidad");
            addHeaderCell(table, "Origen");
            addHeaderCell(table, "Precio unitario");
            addHeaderCell(table, "Ingreso");

            Map<TotalKey, BigDecimal[]> totals = new LinkedHashMap<>();
            BigDecimal totalIncome = BigDecimal.ZERO;

            for (ProductionResponse production : productions) {
                addCell(table, production.productionDate().toString());
                addCell(table, label(production.productType()));
                addCell(table, production.quantity().toPlainString());
                addCell(table, label(production.unit()));
                addCell(table, production.animalId() != null
                        ? "Animal " + production.animalTagNumber()
                        : production.herdId() != null ? "Rodeo " + production.herdName() : "Establecimiento");
                addCell(table, production.pricePerUnit() != null
                        ? "$ " + production.pricePerUnit().toPlainString() : "-");
                addCell(table, production.totalIncome() != null
                        ? "$ " + production.totalIncome().toPlainString() : "-");

                BigDecimal[] total = totals.computeIfAbsent(
                        new TotalKey(production.productType(), production.unit()),
                        key -> new BigDecimal[]{BigDecimal.ZERO});
                total[0] = total[0].add(production.quantity());

                if (production.totalIncome() != null) {
                    totalIncome = totalIncome.add(production.totalIncome());
                }
            }

            document.add(table);

            addSectionTitle(document, "Totales por producto");
            PdfPTable totalsTable = new PdfPTable(3);
            totalsTable.setWidthPercentage(40);
            totalsTable.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_LEFT);
            addHeaderCell(totalsTable, "Producto");
            addHeaderCell(totalsTable, "Cantidad");
            addHeaderCell(totalsTable, "Unidad");
            totals.entrySet().stream()
                    .sorted(Comparator
                            .comparing((Map.Entry<TotalKey, BigDecimal[]> entry) -> entry.getKey().type())
                            .thenComparing(entry -> entry.getKey().unit()))
                    .forEach(entry -> {
                        addCell(totalsTable, label(entry.getKey().type()));
                        addCell(totalsTable, entry.getValue()[0].toPlainString());
                        addCell(totalsTable, label(entry.getKey().unit()));
                    });
            document.add(totalsTable);

            Paragraph income = new Paragraph("Ingreso total: $ " + totalIncome.toPlainString(), BOLD_FONT);
            income.setSpacingBefore(10);
            document.add(income);
            document.add(new Paragraph("Cantidad de registros: " + productions.size(), SMALL_FONT));

            document.close();

            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ReportGenerationException("Unable to generate the PDF report", e);
        }
    }

    // ---------- Helpers ----------

    private void addTitle(Document document, String title, String subtitle) throws DocumentException {
        Paragraph titleParagraph = new Paragraph(title, TITLE_FONT);
        titleParagraph.setSpacingAfter(4);
        document.add(titleParagraph);

        Paragraph subtitleParagraph = new Paragraph(subtitle, SUBTITLE_FONT);
        subtitleParagraph.setSpacingAfter(12);
        document.add(subtitleParagraph);
    }

    private void addSectionTitle(Document document, String text) throws DocumentException {
        Paragraph section = new Paragraph(text, BOLD_FONT);
        section.setSpacingBefore(14);
        section.setSpacingAfter(6);
        document.add(section);
    }

    private String buildRangeText(String noFilterText, String prefix, LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return noFilterText;
        }
        String from = startDate != null ? startDate.toString() : "inicio";
        String to = endDate != null ? endDate.toString() : "hoy";
        return prefix + " entre " + from + " y " + to;
    }

    /** "VACUNACION" -> "Vacunacion"; "EN_SERVICIO" -> "En servicio". */
    private String label(Enum<?> value) {
        String text = value.name().replace('_', ' ').toLowerCase(Locale.ROOT);
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    private String orDash(String value) {
        return value != null && !value.isBlank() ? value : "-";
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
