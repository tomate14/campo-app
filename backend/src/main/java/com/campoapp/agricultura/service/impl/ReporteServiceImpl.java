package com.campoapp.agricultura.service.impl;

import com.campoapp.agricultura.dto.AgriculturaAnalyticsResponse;
import com.campoapp.agricultura.service.ReporteService;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ReporteServiceImpl implements ReporteService {

    @Override
    public byte[] generarReporteAnalyticsPdf(AgriculturaAnalyticsResponse analytics) {
        List<String> lines = new ArrayList<>();
        lines.add("Campo App - Reporte de Performance Agricola");
        lines.add("KPIs");
        lines.add("Total cosechas: " + analytics.kpis().totalCosechas());
        lines.add("Total lotes: " + analytics.kpis().totalLotes());
        lines.add("Toneladas totales: " + analytics.kpis().toneladasTotales());
        lines.add("Rendimiento promedio kg/ha: " + analytics.kpis().rendimientoPromedioKgHa());
        lines.add("Desviacion estandar kg/ha: " + analytics.kpis().desviacionEstandarKgHa());
        lines.add("Prediccion proximo periodo: " + analytics.prediccion().rendimientoEstimadoKgHa());
        lines.add("Confianza: " + analytics.prediccion().confianza());

        StringBuilder content = new StringBuilder("BT\n/F1 12 Tf\n");
        int y = 790;
        for (String line : lines) {
            content.append(String.format(Locale.US, "1 0 0 1 50 %d Tm (%s) Tj\n", y, escape(line)));
            y -= 20;
        }
        content.append("ET");

        String obj1 = "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n";
        String obj2 = "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n";
        String obj3 = "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n";
        String obj4 = "4 0 obj << /Length " + content.toString().getBytes(StandardCharsets.US_ASCII).length + " >> stream\n" +
                content +
                "\nendstream endobj\n";
        String obj5 = "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n";

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        offsets.add(0);
        offsets.add(pdf.length());
        pdf.append(obj1);
        offsets.add(pdf.length());
        pdf.append(obj2);
        offsets.add(pdf.length());
        pdf.append(obj3);
        offsets.add(pdf.length());
        pdf.append(obj4);
        offsets.add(pdf.length());
        pdf.append(obj5);

        int xrefOffset = pdf.length();
        pdf.append("xref\n0 6\n");
        pdf.append("0000000000 65535 f \n");
        for (int index = 1; index <= 5; index += 1) {
            pdf.append(String.format(Locale.US, "%010d 00000 n \n", offsets.get(index)));
        }
        pdf.append("trailer << /Size 6 /Root 1 0 R >>\n");
        pdf.append("startxref\n");
        pdf.append(xrefOffset).append("\n");
        pdf.append("%%EOF");

        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }
}
