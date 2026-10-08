package com.agromanager.report;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;

import java.awt.Color;

/**
 * Estilos y helpers compartidos por todos los generadores de reportes PDF
 * del proyecto, para que cada *ReportService no repita la misma
 * configuración de fuentes/tabla.
 */
public final class ReportPdfUtils {

    public static final Color HEADER_BACKGROUND = new Color(46, 94, 59);

    public static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    public static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.ITALIC);
    public static final Font HEADER_FONT =
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.NORMAL, Color.WHITE);
    public static final Font CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8);
    public static final Font BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    public static final Font SMALL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);

    private ReportPdfUtils() {}

    public static Document newLandscapeDocument() {
        return new Document(PageSize.A4.rotate(), 36, 36, 54, 36);
    }

    public static void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(HEADER_BACKGROUND);
        cell.setPadding(5);
        table.addCell(cell);
    }

    public static void addCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, CELL_FONT));
        cell.setPadding(4);
        table.addCell(cell);
    }
}
