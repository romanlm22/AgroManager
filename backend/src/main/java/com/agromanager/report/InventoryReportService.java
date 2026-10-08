package com.agromanager.report;

import com.agromanager.farm.Farm;
import com.agromanager.farm.FarmAccessDeniedException;
import com.agromanager.farm.FarmRepository;
import com.agromanager.farm.FarmUserRepository;
import com.agromanager.inventory.InventoryItem;
import com.agromanager.inventory.InventoryItemRepository;
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
public class InventoryReportService {

    private static final BigDecimal LOW_STOCK_THRESHOLD = BigDecimal.TEN;
    private static final int EXPIRATION_ALERT_DAYS = 7;

    private final InventoryItemRepository inventoryItemRepository;
    private final FarmRepository farmRepository;
    private final FarmUserRepository farmUserRepository;

    public byte[] generateInventoryReportPdf(UUID farmId, User currentUser) {
        Farm farm = getAuthorizedFarm(farmId, currentUser);

        List<InventoryItem> items = inventoryItemRepository.findAllByFarmId(farmId).stream()
                .sorted(Comparator.comparing(InventoryItem::getName))
                .toList();

        return buildPdf(farm, items);
    }

    private byte[] buildPdf(Farm farm, List<InventoryItem> items) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = newLandscapeDocument();
            PdfWriter.getInstance(document, out);
            document.open();

            Paragraph title = new Paragraph("Reporte de Inventario - " + farm.getName(), TITLE_FONT);
            title.setSpacingAfter(4);
            document.add(title);

            Paragraph subtitle = new Paragraph("Estado actual  |  Generado: " + LocalDate.now(), SUBTITLE_FONT);
            subtitle.setSpacingAfter(12);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(8);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{18, 12, 14, 10, 8, 10, 12, 12});

            addHeaderCell(table, "Nombre");
            addHeaderCell(table, "Categoria");
            addHeaderCell(table, "Proveedor");
            addHeaderCell(table, "Stock");
            addHeaderCell(table, "Unidad");
            addHeaderCell(table, "Precio");
            addHeaderCell(table, "Vencimiento");
            addHeaderCell(table, "Lote");

            BigDecimal totalValue = BigDecimal.ZERO;
            int lowStockCount = 0;
            int expiringSoonCount = 0;
            LocalDate today = LocalDate.now();
            LocalDate expirationLimit = today.plusDays(EXPIRATION_ALERT_DAYS);

            for (InventoryItem item : items) {
                addCell(table, item.getName());
                addCell(table, item.getCategory().name());
                addCell(table, item.getSupplier() != null ? item.getSupplier() : "-");
                addCell(table, item.getStock() != null ? item.getStock().toPlainString() : "-");
                addCell(table, item.getUnit().name());
                addCell(table, item.getPrice() != null ? "$ " + item.getPrice().toPlainString() : "-");
                addCell(table, item.getExpirationDate() != null ? item.getExpirationDate().toString() : "-");
                addCell(table, item.getBatchNumber() != null ? item.getBatchNumber() : "-");

                if (item.getStock() != null && item.getPrice() != null) {
                    totalValue = totalValue.add(item.getStock().multiply(item.getPrice()));
                }
                if (item.getStock() != null && item.getStock().compareTo(LOW_STOCK_THRESHOLD) < 0) {
                    lowStockCount++;
                }
                if (item.getExpirationDate() != null
                        && !item.getExpirationDate().isBefore(today)
                        && !item.getExpirationDate().isAfter(expirationLimit)) {
                    expiringSoonCount++;
                }
            }

            document.add(table);

            Paragraph summary = new Paragraph(
                    "Cantidad de insumos: " + items.size()
                            + "   |   Stock bajo (<10): " + lowStockCount
                            + "   |   Por vencer en 7 dias: " + expiringSoonCount,
                    SMALL_FONT);
            summary.setSpacingBefore(10);
            document.add(summary);

            document.add(new Paragraph("Valor total estimado: $ " + totalValue.toPlainString(), BOLD_FONT));

            document.close();

            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ReportGenerationException("Unable to generate the PDF report", e);
        }
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
