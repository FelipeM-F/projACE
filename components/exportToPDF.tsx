import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { Visit } from "../app/(app)/context/VisitContext";
import { compileWeeklyReport } from "../utils/dateUtils";

export const exportToPDF = async (date: string, visits: Visit[]) => {
  console.log(visits);
  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 14px;
            color: #555;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          .section-title {
            font-weight: bold;
            background-color: #f5f5f5;
            padding: 5px;
            margin-bottom: 5px;
          }
          .signature-area {
            margin-top: 50px;
            border-top: 1px solid #000;
            width: 300px;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">RELATÓRIO DE ATIVIDADES DE CAMPO</div>
          <div class="subtitle">Gerado em: ${new Date().toLocaleDateString()}</div>
        </div>

        ${visits
          .map(
            (visit) => `
          <div class="section">
            <div class="section-title">VISITA ${visits.indexOf(visit) + 1}</div>
            
            <table>
              <tr>
                <th colspan="2" style="background-color: #e6e6e6;">INFORMAÇÕES BÁSICAS</th>
              </tr>
              <tr>
                <td width="30%"><strong>Data:</strong></td>
                <td>${new Date(visit.date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td><strong>Agente:</strong></td>
                <td>${visit.userEmail}</td>
              </tr>
              <tr>
                <td><strong>Atividade:</strong></td>
                <td>${getActivityLabel(visit.atividade || "")}</td>
              </tr>
              <tr>
                <td><strong>Ciclo/Ano:</strong></td>
                <td>${visit.cicloAno || "N/A"}</td>
              </tr>
            <table>
            </table>

              <tr>
                <th colspan="2" style="background-color: #e6e6e6;">LOCALIZAÇÃO</th>
              </tr>
              <tr>
                <td width="30%"><strong>Município:</strong></td>
                <td>${visit.municipio || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Localidade:</strong></td>
                <td>${visit.localidade || "N/A"} - ${
              visit.categoria || "N/A"
            }</td>
              </tr>
              <tr>
                <td><strong>Zona:</strong></td>
                <td>${visit.zona || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Coordenadas:</strong></td>
                <td>${visit.location.latitude.toFixed(
                  6
                )}, ${visit.location.longitude.toFixed(6)}</td>
              </tr>
            </table>

            <table>
              <tr>
                <th colspan="2" style="background-color: #e6e6e6;">DETALHES DA VISITA</th>
              </tr>
              <tr>
                <td width="30%"><strong>Hora de Entrada:</strong></td>
                <td>${visit.horaEntrada || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Tipo de Visita:</strong></td>
                <td>${visit.visita === "N" ? "Normal" : "Recuperação"}</td>
              </tr>
              <tr>
                <td><strong>Status:</strong></td>
                <td>${
                  visit.concluida === "S" ? "Concluída" : "Não Concluída"
                }</td>
              </tr>
              <tr>
                <td><strong>Pendência:</strong></td>
                <td>${
                  visit.pendencia === "R"
                    ? "Recusado"
                    : visit.pendencia === "F"
                    ? "Fechado"
                    : "N/A"
                }</td>
              </tr>
            </table>

            <table>
              <tr>
                <th colspan="2" style="background-color: #e6e6e6;">IMÓVEL</th>
              </tr>
              <tr>
                <td width="30%"><strong>Endereço:</strong></td>
                <td>${visit.logradouro || "N/A"} ${visit.numero || ""} ${
              visit.complemento || ""
            }</td>
              </tr>
              <tr>
                <td><strong>Tipo:</strong></td>
                <td>${getTipoImovelLabel(visit.tipoImovel || "")}</td>
              </tr>
              <tr>
                <td><strong>Quarteirão:</strong></td>
                <td>${visit.quarteirao || "N/A"}</td>
              </tr>
            </table>

            ${
              visit.numDepositos && visit.numDepositos.length > 0
                ? `
              <table>
                <tr>
                  <th colspan="4" style="background-color: #e6e6e6;">ENTOMOLOGIA</th>
                </tr>
                <tr>
                  <td width="25%"><strong>Depósitos Inspecionados:</strong></td>
                  <td width="25%">
                    ${
                      Array.isArray(visit.numDepositos)
                        ? visit.numDepositos
                            .map(
                              (deposit) =>
                                `${deposit.sigla}: ${deposit.quantidade}`
                            )
                            .join(", ")
                        : "N/A"
                    }
                  </td>
                  <td width="25%"><strong>Depósitos Eliminados:</strong></td>
                  <td width="25%">${visit.numDepositosEliminados || "0"}</td>
                </tr>
                <tr>
                  <td><strong>Amostra Inicial:</strong></td>
                  <td>${visit.numAmostraInicial || "N/A"}</td>
                  <td><strong>Amostra Final:</strong></td>
                  <td>${visit.numAmostraFinal || "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Tubitos:</strong></td>
                  <td>${visit.numTubitos || "0"}</td>
                  <td><strong>Tratamento Focal:</strong></td>
                  <td>${visit.tratamentoFocal || "N/A"}</td>
                </tr>
              </table>
              `
                : ""
            }

            <div class="signature-area">
              <p>Assinatura do Agente: __________________________________</p>
              <p>Data: ___/___/_____</p>
            </div>
          </div>
        `
          )
          .join("")}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      width: 595, // A4 width in pixels (210mm)
      height: 842, // A4 height in pixels (297mm)
    });
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    Alert.alert("Error", "Falha ao exportar para PDF.");
  }
};


// Helper functions
const getActivityLabel = (activity: string) => {
  const activities = {
    "1": "1 - LI (Levantamento de Índice)",
    "2": "2 - LI+T (Levantamento com Tratamento)",
    "3": "3 - PE (Ponto Estratégico)",
    "4": "4 - T (Tratamento)",
    "5": "5 - DF (Dispersão de Fêmeas)",
    "6": "6 - PVE (Pesquisa Vetorial Especial)",
  };
  return activity;
};

const getTipoImovelLabel = (tipo: string) => {
  const tipos = {
    R: "Residência",
    C: "Comércio",
    TB: "Terreno Baldio",
    PE: "Ponto Estratégico",
    O: "Outro",
  };
  return tipo;
};
