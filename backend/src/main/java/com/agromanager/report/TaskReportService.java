package com.agromanager.report;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.task.AgriculturalTask;
import com.agromanager.task.AgriculturalTaskRepository;
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
public class TaskReportService {

    private final AgriculturalTaskRepository taskRepository;
    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    public byte[] generateTaskReportPdf(
            UUID farmId, LocalDate startDate, LocalDate endDate, User currentUser) {

        Farm farm = getAuthorizedFarm(farmId, currentUser);

        List<AgriculturalTask> tasks = taskRepository.findAllByField_Farm_Id(farmId).stream()
                .filter(t -> startDate == null || !t.getTaskDate().isBefore(startDate))
                .filter(t -> endDate == null || !t.getTaskDate().isAfter(endDate))
                .sorted(Comparator.comparing(AgriculturalTask::getTaskDate))
                .toList();

        return buildPdf(farm, tasks, startDate, endDate);
    }

    private byte[] buildPdf(Farm farm, List<AgriculturalTask> tasks, LocalDate startDate, LocalDate endDate) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = newLandscapeDocument();
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Reporte de Labores Agricolas - " + farm.getName(), TITLE_FONT);
            title.setSpacingAfter(4);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                    buildRangeText(startDate, endDate) + "  |  Generado: " + LocalDate.now(), SUBTITLE_FONT);
            subtitle.setSpacingAfter(12);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{9, 14, 14, 15, 18, 10, 12});

            addHeaderCell(table, "Fecha");
            addHeaderCell(table, "Tipo");
            addHeaderCell(table, "Lote");
            addHeaderCell(table, "Cultivo");
            addHeaderCell(table, "Responsable");
            addHeaderCell(table, "Estado");
            addHeaderCell(table, "Costo");

            BigDecimal totalCost = BigDecimal.ZERO;

            for (AgriculturalTask task : tasks) {
                addCell(table, task.getTaskDate().toString());
                addCell(table, task.getTaskType().name());
                addCell(table, task.getField().getName());
                addCell(table, task.getCrop() != null
                        ? task.getCrop().getCropType().getName() : "-");
                addCell(table, task.getResponsible().getEmail());
                addCell(table, task.getStatus().name());

                BigDecimal cost = task.getCost() != null ? task.getCost() : BigDecimal.ZERO;
                addCell(table, "$ " + cost.toPlainString());
                totalCost = totalCost.add(cost);
            }

            document.add(table);

            Paragraph totalParagraph = new Paragraph("Costo total: $ " + totalCost.toPlainString(), BOLD_FONT);
            totalParagraph.setSpacingBefore(10);
            document.add(totalParagraph);

            document.add(new Paragraph("Cantidad de labores: " + tasks.size(), SMALL_FONT));

            document.close();

            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ReportGenerationException("Unable to generate the PDF report", e);
        }
    }

    private String buildRangeText(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return "Todas las labores registradas";
        }
        String from = startDate != null ? startDate.toString() : "inicio";
        String to = endDate != null ? endDate.toString() : "hoy";
        return "Periodo: " + from + " a " + to;
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
