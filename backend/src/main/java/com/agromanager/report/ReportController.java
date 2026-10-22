package com.agromanager.report;

import com.agromanager.auth.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/farms/{farmId}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final TaskReportService taskReportService;
    private final InventoryReportService inventoryReportService;
    private final ProductionReportService productionReportService;
    private final ExpenseReportService expenseReportService;
    private final LivestockReportService livestockReportService;

    @GetMapping(value = "/tasks/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getTaskReportPdf(
            @PathVariable UUID farmId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        byte[] pdfBytes = taskReportService.generateTaskReportPdf(
                farmId, startDate, endDate, userDetails.getUser());

        return pdfResponse(pdfBytes, "reporte-labores-" + farmId + ".pdf");
    }

    @GetMapping(value = "/inventory/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getInventoryReportPdf(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        byte[] pdfBytes = inventoryReportService.generateInventoryReportPdf(
                farmId, userDetails.getUser());

        return pdfResponse(pdfBytes, "reporte-inventario-" + farmId + ".pdf");
    }

    @GetMapping(value = "/production/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getProductionReportPdf(
            @PathVariable UUID farmId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        byte[] pdfBytes = productionReportService.generateProductionReportPdf(
                farmId, startDate, endDate, userDetails.getUser());

        return pdfResponse(pdfBytes, "reporte-produccion-" + farmId + ".pdf");
    }

    @GetMapping(value = "/expenses/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getExpenseReportPdf(
            @PathVariable UUID farmId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        byte[] pdfBytes = expenseReportService.generateExpenseReportPdf(
                farmId, startDate, endDate, userDetails.getUser());

        return pdfResponse(pdfBytes, "reporte-gastos-" + farmId + ".pdf");
    }

    @GetMapping(value = "/livestock-stock/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getLivestockStockReportPdf(
            @PathVariable UUID farmId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        byte[] pdfBytes = livestockReportService.generateStockReportPdf(farmId, userDetails.getUser());

        return pdfResponse(pdfBytes, "reporte-stock-ganadero-" + farmId + ".pdf");
    }

    @GetMapping(value = "/livestock-health/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getLivestockHealthReportPdf(
            @PathVariable UUID farmId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        byte[] pdfBytes = livestockReportService.generateHealthReportPdf(
                farmId, startDate, endDate, userDetails.getUser());

        return pdfResponse(pdfBytes, "reporte-sanitario-" + farmId + ".pdf");
    }

    @GetMapping(value = "/livestock-production/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getLivestockProductionReportPdf(
            @PathVariable UUID farmId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        byte[] pdfBytes = livestockReportService.generateProductionReportPdf(
                farmId, startDate, endDate, userDetails.getUser());

        return pdfResponse(pdfBytes, "reporte-produccion-ganadera-" + farmId + ".pdf");
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] pdfBytes, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
