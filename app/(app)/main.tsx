import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useVisitContext, Visit } from "./context/VisitContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { exportToPDF } from "../../components/exportToPDF";
import {exportWeeklyToPDF} from "../../components/exportWeekToPdf";
import { exportToXLSX } from "../../components/exportToXLSX";
import mainStyles from "../styles/main.styles";
import CustomButton from "../../components/CustomButton";
import { getAuth } from "firebase/auth";
import { getEpidemiologicalWeek } from "@/utils/dateUtils";

const LOCAL_STORAGE_KEY = "visits";

const Main = () => {
  const { visits, deleteVisit, syncVisits } = useVisitContext();
  const router = useRouter();
  const [expandedMonths, setExpandedMonths] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [expandedWeeks, setExpandedWeeks] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [expandedDays, setExpandedDays] = React.useState<{
    [key: string]: boolean;
  }>({});

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };
  const toggleWeek = (month: string, week: string) => {
    setExpandedWeeks((prev) => ({
      ...prev,
      [month + week]: !prev[month + week],
    }));
  };
  const toggleDay = (month: string, week: string, day: string) => {
    setExpandedDays((prev) => ({
      ...prev,
      [month + week + day]: !prev[month + week + day],
    }));
  };

  // Agrupa visitas por mês > semana > dia
  const groupedByMonthWeekDay = React.useMemo(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return {};

    const sortedVisits = visits
      .filter((visit) => visit.dataAtividade && visit.userId === user.uid)
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
      const week = getEpidemiologicalWeek(date);
      const year = date.getFullYear();
      const weekKey = `${year}-W${week}`;
      const dayKey = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

      if (!acc[monthYearKey]) acc[monthYearKey] = {};
      if (!acc[monthYearKey][weekKey]) acc[monthYearKey][weekKey] = {};
      if (!acc[monthYearKey][weekKey][dayKey])
        acc[monthYearKey][weekKey][dayKey] = [];
      acc[monthYearKey][weekKey][dayKey].push(visit);

      return acc;
    }, {});
  }, [visits]);

  const renderGroupedVisits = () =>
    Object.entries(groupedByMonthWeekDay).map(([monthYear, weeksObj]) => {
      const weeks = weeksObj as {
        [weekKey: string]: { [dayKey: string]: Visit[] };
      };
      return (
        <View key={monthYear} style={mainStyles.dateGroup}>
          <Text
            style={mainStyles.dateHeader}
            onPress={() => toggleMonth(monthYear)}
          >
            {monthYear}
          </Text>
          {expandedMonths[monthYear] && (
            <View>
              {Object.entries(weeks).map(([weekKey, daysObj]) => {
                const days = daysObj as { [dayKey: string]: Visit[] };
                // Descobre o período da semana
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
                      onPress={() => toggleWeek(monthYear, weekKey)}
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
                                  toggleDay(monthYear, weekKey, day)
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
                                        Location: {visit.location.latitude},{" "}
                                        {visit.location.longitude}
                                      </Text>
                                      <Text style={mainStyles.visitText}>
                                        Registered by: {visit.userName}
                                      </Text>
                                      <CustomButton
                                        title="Edit"
                                        onPress={() =>
                                          router.push(`/form?id=${visit.id}`)
                                        }
                                      />
                                      <CustomButton
                                        title="Delete"
                                        onPress={() => handleDelete(visit.id)}
                                        color="red"
                                      />
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

  const handleSync = async () => {
    try {
      const storedVisits = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedVisits) {
        const parsedVisits: Visit[] = JSON.parse(storedVisits);

        // Envia os dados locais para o Firestore
        for (const visit of parsedVisits) {
          if (!visit.id.startsWith("offline-")) continue; // Ignora visitas já sincronizadas
          await addDoc(collection(firestore, "visits"), {
            ...visit,
            date: Timestamp.fromDate(visit.date),
          });
        }

        // Atualiza o estado local e remove os IDs offline
        const syncedVisits = parsedVisits.map((visit) => ({
          ...visit,
          id: visit.id.startsWith("offline-") ? uuidv4() : visit.id,
        }));
        await AsyncStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(syncedVisits)
        );
        console.log("Visits synced with Firestore.");
        syncVisits(); // Atualiza o estado global
      }

      Alert.alert("Success", "Visits synchronized with Firestore!");
    } catch (error) {
      console.error("Error syncing visits:", error);
      Alert.alert("Error", "Failed to sync visits.");
    }
  };

  return (
    <View style={mainStyles.container}>
      <Text style={mainStyles.title}>Registered Visits</Text>
      <ScrollView>{renderGroupedVisits()}</ScrollView>
      <CustomButton
        title="Create New Visit"
        onPress={() => router.push("/form")}
      />
      <CustomButton title="Sync Visits" onPress={handleSync} />
    </View>
  );
};

export default Main;
