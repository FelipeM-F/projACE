import { Visit } from "../app/(app)/context/VisitContext";

export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Retorna o número da semana epidemiológica para uma data.
 */
export function getEpidemiologicalWeek(date: Date): number {
  const janFirst = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - janFirst.getTime()) / 86400000);
  return Math.ceil((days + janFirst.getDay() + 1) / 7);
}

/**
 * Compila os dados das visitas agrupando por semana epidemiológica.
 */
export function compileWeeklyReport(visits: Visit[]) {
  // Garante que dataAtividade é sempre Date
  const visitsWithDate = visits.map((visit) => ({
    ...visit,
    dataAtividade:
      typeof visit.dataAtividade === "string"
        ? new Date(visit.dataAtividade)
        : visit.dataAtividade,
  }));

  // Agrupa visitas por semana epidemiológica
  const grouped: { [key: string]: Visit[] } = {};
  visitsWithDate.forEach((visit) => {
    const week = getEpidemiologicalWeek(visit.dataAtividade);
    const year = visit.dataAtividade.getFullYear();
    const key = `${year}-W${week}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(visit);
  });

  // Compila os dados agregados por semana
  return Object.entries(grouped).map(([weekKey, weekVisits]) => {
    // Dados básicos (pega do primeiro registro da semana)
    const municipio = weekVisits[0].municipio;
    const localidade = weekVisits[0].localidade;
    const zona = weekVisits[0].zona;
    const categoria = weekVisits[0].categoria;
    const tipo = weekVisits[0].tipo;
    const cicloAno = weekVisits[0].cicloAno;
    const atividade = weekVisits[0].atividade;

    // Datas de início e fim da semana
    const dataInicio = weekVisits.reduce(
      (min, v) => (v.dataAtividade < min ? v.dataAtividade : min),
      weekVisits[0].dataAtividade
    );

    const dataFinal = weekVisits.reduce(
      (max, v) => (v.dataAtividade > max ? v.dataAtividade : max),
      weekVisits[0].dataAtividade
    );

    // Total de quarteirões únicos concluídos
    const quarteiroes = weekVisits
      .map((v) => v.quarteirao)
      .filter((v, i, arr) => arr.indexOf(v) === i).length;

    // Total de imóveis por tipo
    const tipos = [
      "R: Residência",
      "C: Comércio",
      "TB: Terreno Baldio",
      "PE: Ponto Estratégico",
      "O: Outro",
    ];
    console.log("weekVisits", weekVisits);
    const tiposImovel: { [tipo: string]: number } = {};
    try {
      weekVisits.forEach((v) => {
        console.log("v.tipoImovel", v.tipoImovel);
        if (v.tipoImovel) {
          tiposImovel[v.tipoImovel] = (tiposImovel[v.tipoImovel] || 0) + 1;
        }
      });
    } catch (e) {
      console.error("Erro ao calcular tiposImovel:", e);
    }

    // Soma de depósitos inspecionados por tipo
    const depositSiglas = ["A1", "A2", "B", "C", "D1", "D2", "E"];
    const depositosPorTipo: { [sigla: string]: number } = {};
    try {
      depositSiglas.forEach((sigla) => {
        depositosPorTipo[sigla] = 0;
      });
      weekVisits.forEach((v) => {
        if (Array.isArray(v.numDepositos)) {
          v.numDepositos.forEach((dep) => {
            if (depositosPorTipo.hasOwnProperty(dep.sigla)) {
              depositosPorTipo[dep.sigla] += Number(dep.quantidade || 0);
            }
          });
        }
      });
      console.log("depositosPorTipo", depositosPorTipo);
    } catch (e) {
      console.error("Erro ao calcular depositosPorTipo:", e);
    }
    // Soma de depósitos eliminados
    const depositosEliminados = weekVisits.reduce(
      (sum, v) => sum + Number(v.numDepositosEliminados || 0),
      0
    );

    // Soma de tubitos coletados
    const tubitos = weekVisits.reduce(
      (sum, v) => sum + Number(v.numTubitos || 0),
      0
    );

    // Soma de imóveis tratados (tratamento focal/perifocal)
    const tratamentoFocal =
      weekVisits[weekVisits.length - 1]?.tratamentoFocal || "";
    const tratamentoPerifocal =
      weekVisits[weekVisits.length - 1]?.tratamentoPerifocal || "";

    // Soma de pendências (Recusado, Fechado)
    const pendencias = {
      recusado: weekVisits.filter((v) => v.pendencia === "R").length,
      fechado: weekVisits.filter((v) => v.pendencia === "F").length,
    };

    // Soma de visitas concluídas
    const concluidas = weekVisits.filter((v) => v.concluida === "S").length;
    return {
      weekKey,
      municipio,
      localidade,
      zona,
      categoria,
      tipo,
      cicloAno,
      atividade,
      dataInicio,
      dataFinal,
      quarteiroes,
      tiposImovel,
      depositosPorTipo,
      depositosEliminados,
      tubitos,
      tratamentoFocal,
      tratamentoPerifocal,
      pendencias,
      concluidas,
      // Adicione outros campos agregados conforme necessário
    };
  });
}
