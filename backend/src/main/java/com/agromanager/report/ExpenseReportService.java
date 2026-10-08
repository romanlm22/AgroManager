package com.agromanager.report;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.machinery.MachineryMaintenance;
import com.agromanager.machinery.MachineryMaintenanceRepository;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import static com.agromanager.report.ReportPdfUtils.*;

@Service
@RequiredArgsConstructor
public class ExpenseReportService {

    private final AgriculturalTaskRepository taskRepository;
    private final MachineryMaintenanceRepository maintenanceRepository;
    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    public byte[] generateExpenseReportPdf(
            UUID farmId, LocalDate startDate, LocalDate endDate, User currentUser) {

        Farm farm = getAuthorizedFarm(farmId, currentUser);

        List<ExpenseEntry> taskExpenses = taskRepository.findAllByField_Farm_Id(farmId).stream()
                .filter(t -> startDate == null || !t.getTaskDate().isBefore(startDate))
                .filter(t -> endDate == null || !t.getTaskDate().isAfter(endDate))
                .map(t -> new ExpenseEntry(
                        t.getTaskDate(),
                        "Labor",
                        t.getTaskType().name() + " - " + t.getField().getName(),
                        t.getCost() != null ? t.getCost() : BigDecimal.ZERO))
                .toList();

        List<ExpenseEntry> maintenanceExpenses = maintenanceRepository
                .findAllByMachinery_Farm_Id(farmId).stream()
                .filter(m -> startDate == null || !m.getMaintenanceDate().isBefore(startDate))
                .filter(m -> endDate == null || !m.getMaintenanceDate().isAfter(endDate))
                .map(m -> new ExpenseEntry(
                        m.getMaintenanceDate(),
                        "Mantenimiento",
                        m.getMachinery().getName()
                                + (m.getDescription() != null ? " - " + m.getDescription() : ""),
                        m.getCost() != null ? m.getCost() : BigDecimal.ZERO))
                .toList();

        List<ExpenseEntry> allExpenses = new ArrayList<>();
        allExpenses.addAll(taskExpenses);
        allExpenses.addAll(maintenanceExpenses);
        allExpenses.sort(Comparator.comparing(ExpenseEntry::date));

        BigDecimal taskTotal = sum(taskExpenses);
        BigDecimal maintenanceTotal = sum(maintenanceExpenses);

        return buildPdf(farm, allExpenses, taskTotal, maintenanceTotal, startDate, endDate);
    }

    private byte[] buildPdf(
            Farm farm, List<ExpenseEntry> expenses,
            BigDecimal taskTotal, BigDecimal maintenanceTotal,
            LocalDate startDate, LocalDate endDate) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = newLandscapeDocument();
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Reporte de Gastos - " + farm.getName(), TITLE_FONT);
            title.setSpacingAfter(4);
            document.add(title);

            Paragraph subtitle = new Paragraph(
                    buildRangeText(startDate, endDate) + "  |  Generado: " + LocalDate.now(), SUBTITLE_FONT);
            subtitle.setSpacingAfter(12);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{12, 18, 50, 20});

            addHeaderCell(table, "Fecha");
            addHeaderCell(table, "Tipo");
            addHeaderCell(table, "Descripcion");
            addHeaderCell(table, "Costo");

            for (ExpenseEntry entry : expenses) {
                addCell(table, entry.date().toString());
                addCell(table, entry.type());
                addCell(table, entry.description());
                addCell(table, "$ " + entry.cost().toPlainString());
            }

            document.add(table);

            BigDecimal grandTotal = taskTotal.add(maintenanceTotal);

            Paragraph summary = new Paragraph(
                    "Costo total labores: $ " + taskTotal.toPlainString()
                            + "   |   Costo total mantenimientos: $ " + maintenanceTotal.toPlainString(),
                    SMALL_FONT);
            summary.setSpacingBefore(10);
            document.add(summary);

            document.add(new Paragraph("Costo total general: $ " + grandTotal.toPlainString(), BOLD_FONT));

            document.close();

            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ReportGenerationException("Unable to generate the PDF report", e);
        }
    }

    private BigDecimal sum(List<ExpenseEntry> entries) {
        return entries.stream()
                .map(ExpenseEntry::cost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String buildRangeText(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) {
            return "Todos los gastos registrados";
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

    private record ExpenseEntry(LocalDate date, String type, String description, BigDecimal cost) {}
}
