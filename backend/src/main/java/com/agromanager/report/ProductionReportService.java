package com.agromanager.report;

import com.agromanager.crop.Crop;
import com.agromanager.crop.CropRepository;
import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
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
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import static com.agromanager.report.ReportPdfUtils.*;

@Service
@RequiredArgsConstructor
public class ProductionReportService {

    private final CropRepository cropRepository;
    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    public byte[] generateProductionReportPdf(
            UUID farmId, LocalDate startDate, LocalDate endDate, User currentUser) {

        Farm farm = getAuthorizedFarm(farmId, currentUser);

        boolean hasDateFilter = startDate != null || endDate != null;

        List<Crop> crops = cropRepository.findAllByField_Farm_Id(farmId).stream()
                .filter(c -> !hasDateFilter || c.getActualHarvestDate() != null)
                .filter(c -> startDate == null || c.getActualHarvestDate() == null
                        || !c.getActualHarvestDate().isBefore(startDate))
                .filter(c -> endDate == null || c.getActualHarvestDate() == null
                        || !c.getActualHarvestDate().isAfter(endDate))
                .sorted(Comparator.comparing(Crop::getPlantingDate))
                .toList();

        return buildPdf(farm, crops, startDate, endDate);
    }

    private byte[] buildPdf(Farm farm, List<Crop> crops, LocalDate startDate, LocalDate endDate) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = newLandscapeDocument();
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Reporte de Produccion - " + farm.getName(), TITLE_FONT);
            title.setSpacingAfter(4);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                    buildRangeText(startDate, endDate) + "  |  Generado: " + LocalDate.now(), SUBTITLE_FONT);
            subtitle.setSpacingAfter(12);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{12, 14, 11, 11, 11, 11, 11, 10});

            addHeaderCell(table, "Lote");
            addHeaderCell(table, "Cultivo");
            addHeaderCell(table, "Siembra");
            addHeaderCell(table, "Cosecha");
            addHeaderCell(table, "Sup. (ha)");
            addHeaderCell(table, "Rinde (kg/ha)");
            addHeaderCell(table, "Produccion (kg)");
            addHeaderCell(table, "Estado");

            BigDecimal totalPlantedArea = BigDecimal.ZERO;
            BigDecimal totalProductionKg = BigDecimal.ZERO;

            for (Crop crop : crops) {
                addCell(table, crop.getField().getName());
                addCell(table, crop.getCropType().getName());
                addCell(table, crop.getPlantingDate().toString());
                addCell(table, crop.getActualHarvestDate() != null
                        ? crop.getActualHarvestDate().toString() : "-");
                addCell(table, crop.getPlantedAreaHa() != null
                        ? crop.getPlantedAreaHa().toPlainString() : "-");
                addCell(table, crop.getYieldKgHa() != null
                        ? crop.getYieldKgHa().toPlainString() : "-");

                BigDecimal productionKg = null;
                if (crop.getYieldKgHa() != null && crop.getPlantedAreaHa() != null) {
                    productionKg = crop.getYieldKgHa().multiply(crop.getPlantedAreaHa());
                    totalProductionKg = totalProductionKg.add(productionKg);
                }
                addCell(table, productionKg != null ? productionKg.toPlainString() : "-");
                addCell(table, crop.getStatus().name());

                if (crop.getPlantedAreaHa() != null) {
                    totalPlantedArea = totalPlantedArea.add(crop.getPlantedAreaHa());
                }
            }

            document.add(table);

            Paragraph summary = new Paragraph(
                    "Superficie sembrada total: " + totalPlantedArea.toPlainString() + " ha   |   "
                            + "Produccion total estimada: " + totalProductionKg.toPlainString() + " kg",
                    BOLD_FONT);
            summary.setSpacingBefore(10);
            document.add(summary);

            document.add(new Paragraph("Cantidad de cultivos: " + crops.size(), SMALL_FONT));

            document.close();

            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ReportGenerationException("Unable to generate the PDF report", e);
        }
    }

    private String buildRangeText(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return "Todos los cultivos registrados";
        }
        String from = startDate != null ? startDate.toString() : "inicio";
        String to = endDate != null ? endDate.toString() : "hoy";
        return "Cosechas entre " + from + " y " + to;
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
