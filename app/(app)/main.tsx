import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useVisitContext, Visit } from "./context/VisitContext";
import { useRouter } from "expo-router";
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { exportToPDF } from "../../components/exportToPDF";
import { exportWeeklyToPDF } from "../../components/exportWeekToPdf";
import { exportToXLSX } from "../../components/exportToXLSX";
import mainStyles from "../styles/main.styles";
import CustomButton from "../../components/CustomButton";
import { getAuth } from "firebase/auth";
import { getEpidemiologicalWeek } from "@/utils/dateUtils";

const Main = () => {
  const { visits, deleteVisit } = useVisitContext();
  const router = useRouter();
  const [expandedMonths, setExpandedMonths] = React.useState<
    Record<string, boolean>
  >({});
  const [expandedWeeks, setExpandedWeeks] = React.useState<
    Record<string, boolean>
  >({});
  const [expandedDays, setExpandedDays] = React.useState<
    Record<string, boolean>
  >({});
  const [userProfile, setUserProfile] = React.useState<{
    perfil: string;
    municipio: string;
  } | null>(null);

  // Toggle helpers
  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
    key: string
  ) => setter((prev) => ({ ...prev, [key]: !prev[key] }));

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        setUserProfile(
          userDoc.exists()
            ? (userDoc.data() as { perfil: string; municipio: string })
            : null
        );
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        setUserProfile(null);
      }
    };
    fetchUserProfile();
  }, []);

  // Agrupa visitas por mês > semana > dia
  const groupedByMonthWeekDay = React.useMemo(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !userProfile) return {};

    const { perfil, municipio } = userProfile;
    const filteredVisits =
      perfil === "digitador"
        ? visits.filter((v) => v.municipio === municipio)
        : visits.filter((v) => v.userId === user.uid);

    const sortedVisits = filteredVisits
      .filter((visit) => visit.dataAtividade)
      .map((visit) => ({
        ...visit,
        dataAtividade: new Date(visit.dataAtividade),
      }))
      .sort((a, b) => b.dataAtividade.getTime() - a.dataAtividade.getTime());

    return sortedVisits.reduce((acc: any, visit) => {
      const date = visit.dataAtividade;
      const monthYearKey = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
      const weekKey = `${date.getFullYear()}-W${getEpidemiologicalWeek(date)}`;
      const dayKey = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

      acc[monthYearKey] = acc[monthYearKey] || {};
      acc[monthYearKey][weekKey] = acc[monthYearKey][weekKey] || {};
      acc[monthYearKey][weekKey][dayKey] =
        acc[monthYearKey][weekKey][dayKey] || [];
      acc[monthYearKey][weekKey][dayKey].push(visit);

      return acc;
    }, {});
  }, [visits, userProfile]);

  const renderGroupedVisits = () =>
    Object.entries(groupedByMonthWeekDay).map(([monthYear, weeksObj]) => {
      const weeks = weeksObj as {
        [weekKey: string]: { [dayKey: string]: Visit[] };
      };
      return (
        <View key={monthYear} style={mainStyles.dateGroup}>
          <Text
            style={mainStyles.dateHeader}
            onPress={() => toggle(setExpandedMonths, monthYear)}
          >
            {monthYear}
          </Text>
          {expandedMonths[monthYear] && (
            <View>
              {Object.entries(weeks).map(([weekKey, daysObj]) => {
                const days = daysObj as { [dayKey: string]: Visit[] };
                const allVisits = Object.values(days).flat() as Visit[];
                const sorted = [...allVisits].sort(
                  (a, b) =>
                    new Date(a.dataAtividade).getTime() -
                    new Date(b.dataAtividade).getTime()
                );
                const start = sorted[0]?.dataAtividade
                  ? new Date(sorted[0].dataAtividade)
                  : null;
                const end = sorted[sorted.length - 1]?.dataAtividade
                  ? new Date(sorted[sorted.length - 1].dataAtividade)
                  : null;

                return (
                  <View
                    key={weekKey}
                    style={{ marginLeft: 10, marginBottom: 10 }}
                  >
                    <Text
                      style={{ fontWeight: "bold", color: "#007bff" }}
                      onPress={() =>
                        toggle(setExpandedWeeks, monthYear + weekKey)
                      }
                    >
                      {expandedWeeks[monthYear + weekKey] ? "▼" : "▶"} Semana:{" "}
                      {weekKey}
                      {start && end
                        ? ` (${start.toLocaleDateString(
                            "pt-BR"
                          )} - ${end.toLocaleDateString("pt-BR")})`
                        : ""}
                    </Text>
                    {expandedWeeks[monthYear + weekKey] && (
                      <View>
                        {Object.entries(days).map(([day, visitsArr]) => {
                          const visits = visitsArr as Visit[];
                          return (
                            <View key={day} style={mainStyles.dateGroup}>
                              <Text
                                style={mainStyles.dateHeader}
                                onPress={() =>
                                  toggle(
                                    setExpandedDays,
                                    monthYear + weekKey + day
                                  )
                                }
                              >
                                {day}
                              </Text>
                              {expandedDays[monthYear + weekKey + day] && (
                                <View style={mainStyles.visitList}>
                                  {visits.map((visit) => (
                                    <View
                                      key={visit.id}
                                      style={mainStyles.visitItem}
                                    >
                                      <Text style={mainStyles.visitText}>
                                        Data:{" "}
                                        {visit.dataAtividade.toLocaleDateString(
                                          "pt-BR"
                                        )}
                                      </Text>
                                      <Text style={mainStyles.visitText}>
                                        Ciclo: {visit.cicloAno}
                                      </Text>
                                      <Text style={mainStyles.visitText}>
                                        Registrado por: {visit.userEmail}
                                      </Text>
                                      {userProfile && userProfile.perfil === "cadastrador" && (
                                        <>
                                          <CustomButton
                                            title="Edit"
                                            onPress={() =>
                                              router.push(
                                                `/form?id=${visit.id}`
                                              )
                                            }
                                          />
                                          <CustomButton
                                            title="Delete"
                                            onPress={() =>
                                              handleDelete(visit.id)
                                            }
                                            color="red"
                                          />
                                        </>
                                      )}
                                    </View>
                                  ))}
                                  <CustomButton
                                    title="Export to PDF"
                                    onPress={() => exportToPDF(day, visits)}
                                  />
                                  <CustomButton
                                    title="Export to XLSX"
                                    onPress={() => exportToXLSX(day, visits)}
                                  />
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    )}
                    <CustomButton
                      title="Exportar Relatório Semanal (FAD-07)"
                      onPress={() => exportWeeklyToPDF(allVisits)}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      );
    });

  const handleDelete = (id: string) => {
    Alert.alert("Delete Visit", "Are you sure you want to delete this visit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteVisit(id);
          Alert.alert("Deleted", "Visit has been deleted.");
        },
      },
    ]);
  };

  if (!userProfile) {
    return (
      <View style={mainStyles.container}>
        <Text style={mainStyles.title}>Carregando perfil do usuário...</Text>
      </View>
    );
  }

  return (
    <View style={mainStyles.container}>
      <Text style={mainStyles.title}>Visitas</Text>
      <ScrollView>{renderGroupedVisits()}</ScrollView>
      <CustomButton
        title="Registrar nova visita"
        onPress={() => router.push("/form")}
      />
    </View>
  );
};

export default Main;
