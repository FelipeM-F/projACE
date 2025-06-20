import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { Visit } from "../app/(app)/context/VisitContext";
import { compileWeeklyReport } from "../utils/dateUtils";

export const exportWeeklyToPDF = async (visits: Visit[]) => {
  // Sempre agrupa por usuário
  const visitsByUser: { [userId: string]: Visit[] } = {};
  visits.forEach((v) => {
    if (!visitsByUser[v.userId]) visitsByUser[v.userId] = [];
    visitsByUser[v.userId].push(v);
  });

  const htmlContentWeek = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .user-section { page-break-after: always; }
        </style>
      </head>
      <body>
        
        ${Object.entries(visitsByUser)
          .map(([userId, userVisits], idx, arr) => {
            if (!userVisits.length) return "";
            const userEmail = userVisits[0].userEmail || userId;
            const weeklyReports = compileWeeklyReport(userVisits);
            const userName = userVisits[0].userName || "";

            return `
              <div class="user-section">
                <h2>FAD-07 - Registro Diário do Serviço Antivetorial</h2>
                <h2 style="color:#007bff;">Usuário: ${userName} </h2>
                ${weeklyReports
                  .map((report) => {
                    let focal = { tipo: "", quantidadeGramas: "", quantidadeDepTrat: "" };
                    let perifocal = { tipo: "", quantidadeCargas: "" };
                    try {
                      if (typeof report.tratamentoFocal === "string" && report.tratamentoFocal) {
                        focal = JSON.parse(report.tratamentoFocal);
                      }
                    } catch {}
                    try {
                      if (typeof report.tratamentoPerifocal === "string" && report.tratamentoPerifocal) {
                        perifocal = JSON.parse(report.tratamentoPerifocal);
                      }
                    } catch {}

                    const depositSiglas = ["A1", "A2", "B", "C", "D1", "D2", "E"];
                    const depositosPorTipo = depositSiglas.reduce(
                      (acc, sigla) => ({
                        ...acc,
                        [sigla]: report.depositosPorTipo?.[sigla] ?? 0,
                      }),
                      {} as { [sigla: string]: number }
                    );

                    const tiposImovelSiglas = ["R", "C", "TB", "PE", "O"];
                    const tiposImovel = tiposImovelSiglas.reduce(
                      (acc, tipo) => ({
                        ...acc,
                        [tipo]: report.tiposImovel?.[tipo] ?? 0,
                      }),
                      {} as { [tipo: string]: number }
                    );

                    return `
                      <h3>
                        Semana: ${report.weekKey}
                        <span style="font-weight:normal;">
                          (${new Date(report.dataInicio).toLocaleDateString()} - ${new Date(report.dataFinal).toLocaleDateString()})
                        </span>
                      </h3>
                      <table>
                        <tr><td><strong>Usuário responsável:</strong></td><td>${userEmail}</td></tr>
                        <tr><td><strong>Município:</strong></td><td>${report.municipio || "-"}</td></tr>
                        <tr><td><strong>Localidade:</strong></td><td>${report.localidade || "-"}</td></tr>
                        <tr><td><strong>Zona:</strong></td><td>${report.zona || "-"}</td></tr>
                        <tr><td><strong>Categoria:</strong></td><td>${report.categoria || "-"}</td></tr>
                        <tr><td><strong>Tipo:</strong></td><td>${report.tipo || "-"}</td></tr>
                        <tr><td><strong>Ciclo/Ano:</strong></td><td>${report.cicloAno || "-"}</td></tr>
                        <tr><td><strong>Atividade:</strong></td><td>${report.atividade || "-"}</td></tr>
                        <tr><td><strong>Data início:</strong></td><td>${report.dataInicio ? new Date(report.dataInicio).toLocaleDateString() : "-"}</td></tr>
                        <tr><td><strong>Data final:</strong></td><td>${report.dataFinal ? new Date(report.dataFinal).toLocaleDateString() : "-"}</td></tr>
                        <tr><td><strong>Quarteirões concluídos:</strong></td><td>${report.quarteiroes ?? 0}</td></tr>
                        <tr>
                          <td><strong>Imóveis por tipo:</strong></td>
                          <td>
                            ${Object.entries(tiposImovel)
                              .map(([tipo, qtd]) => `${tipo}: ${qtd}`)
                              .join(", ")}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Depósitos Inspecionados:</strong></td>
                          <td>
                            ${Object.entries(depositosPorTipo)
                              .map(([sigla, qtd]) => `${sigla}: ${qtd}`)
                              .join(", ")}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Depósitos Eliminados:</strong></td>
                          <td>${report.depositosEliminados ?? 0}</td>
                        </tr>
                        <tr>
                          <td><strong>Tubitos Coletados:</strong></td>
                          <td>${report.tubitos ?? 0}</td>
                        </tr>
                        <tr>
                          <td><strong>Tratamento Focal:</strong></td>
                          <td>
                            Tipo: ${focal.tipo || "-"}<br/>
                            Qtde. (g): ${focal.quantidadeGramas || "0"}<br/>
                            Qtde. dep. trat.: ${focal.quantidadeDepTrat || "0"}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Tratamento Perifocal:</strong></td>
                          <td>
                            Tipo Adulticida: ${perifocal.tipo || "-"}<br/>
                            Qtde. cargas: ${perifocal.quantidadeCargas || "0"}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Pendências:</strong></td>
                          <td>
                            Recusado: ${report.pendencias?.recusado ?? 0}, Fechado: ${report.pendencias?.fechado ?? 0}
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Visitas Concluídas:</strong></td>
                          <td>${report.concluidas ?? 0}</td>
                        </tr>
                      </table>
                    `;
                  })
                  .join("")}
              </div>
              
            `;
          })
          .join("")}
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContentWeek,
      width: 595,
      height: 842,
    });
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    Alert.alert("Error", "Falha ao exportar para PDF.");
  }
};