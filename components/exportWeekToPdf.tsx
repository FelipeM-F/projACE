import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { Visit } from "../app/(app)/context/VisitContext";
import { compileWeeklyReport } from "../utils/dateUtils";


export const exportWeeklyToPDF = async (visits: Visit[]) => {
  const visitsWithDate = visits.map((v) => ({
    ...v,
    dataAtividade:
      typeof v.dataAtividade === "string"
        ? new Date(v.dataAtividade)
        : v.dataAtividade,
  }));

  console.log("Visitas", visitsWithDate);
  const weeklyReports = compileWeeklyReport(visitsWithDate);
  console.log("Visitas por semana", weeklyReports);
  const htmlContentWeek = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>FAD-07 - Registro Diário do Serviço Antivetorial</h2>
${weeklyReports
  .map(
    (report) => `
      <h3>
        Semana: ${report.weekKey}
        <span style="font-weight:normal;">
          (${new Date(report.dataInicio).toLocaleDateString()} - ${new Date(report.dataFinal).toLocaleDateString()})
        </span>
      </h3>
      <table>
        <tr><td><strong>Município:</strong></td><td>${report.municipio}</td></tr>
        <tr><td><strong>Localidade:</strong></td><td>${report.localidade}</td></tr>
        <tr><td><strong>Zona:</strong></td><td>${report.zona}</td></tr>
        <tr><td><strong>Categoria:</strong></td><td>${report.categoria}</td></tr>
        <tr><td><strong>Tipo:</strong></td><td>${report.tipo}</td></tr>
        <tr><td><strong>Ciclo/Ano:</strong></td><td>${report.cicloAno}</td></tr>
        <tr><td><strong>Atividade:</strong></td><td>${report.atividade}</td></tr>
        <tr><td><strong>Data início:</strong></td><td>${new Date(report.dataInicio).toLocaleDateString()}</td></tr>
        <tr><td><strong>Data final:</strong></td><td>${new Date(report.dataFinal).toLocaleDateString()}</td></tr>
        <tr><td><strong>Quarteirões concluídos:</strong></td><td>${report.quarteiroes}</td></tr>
        <tr>
          <td><strong>Imóveis por tipo:</strong></td>
          <td>
            ${Object.entries(report.tiposImovel)
              .map(([tipo, qtd]) => `${tipo}: ${qtd}`)
              .join(", ")}
          </td>
        </tr>
        <tr>
          <td><strong>Depósitos Inspecionados:</strong></td>
          <td>
            ${Object.entries(report.depositosPorTipo)
              .map(([sigla, qtd]) => `${sigla}: ${qtd}`)
              .join(", ")}
          </td>
        </tr>
        <tr>
          <td><strong>Depósitos Eliminados:</strong></td>
          <td>${report.depositosEliminados}</td>
        </tr>
        <tr>
          <td><strong>Tubitos Coletados:</strong></td>
          <td>${report.tubitos}</td>
        </tr>
        <tr>
          <td><strong>Tratamento Focal:</strong></td>
          <td>${report.tratamentoFocal}</td>
        </tr>
        <tr>
          <td><strong>Tratamento Perifocal:</strong></td>
          <td>${report.tratamentoPerifocal}</td>
        </tr>
        <tr>
          <td><strong>Pendências:</strong></td>
          <td>
            Recusado: ${report.pendencias.recusado}, Fechado: ${report.pendencias.fechado}
          </td>
        </tr>
        <tr>
          <td><strong>Visitas Concluídas:</strong></td>
          <td>${report.concluidas}</td>
        </tr>
      </table>
    `
  )
  .join("")}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContentWeek,
      width: 595, // A4 width in pixels (210mm)
      height: 842, // A4 height in pixels (297mm)
    });
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    Alert.alert("Error", "Falha ao exportar para PDF.");
  }
};