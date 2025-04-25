import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useVisitContext, Visit } from "./context/VisitContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { v4 as uuidv4 } from "uuid";
import { exportToPDF } from "../../components/exportToPDF";
import { exportToXLSX } from "../../components/exportToXLSX";
import mainStyles from "../styles/main.styles";
import CustomButton from "../../components/CustomButton";
import { getAuth } from "firebase/auth";


const LOCAL_STORAGE_KEY = "visits";

const Main = () => {
  const { visits, deleteVisit, syncVisits } = useVisitContext();
  const router = useRouter();
  const [expandedDates, setExpandedDates] = React.useState<{ [key: string]: boolean }>({});

  const toggleDateGroup = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date], // Alterna o estado de expansão para a data clicada
    }));
  };

  const groupVisitsByMonthAndDay = (visits: Visit[]) => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      console.error("User is not authenticated.");
      return {};
    }
  
    const sortedVisits = visits
      .filter((visit) => visit.dataAtividade && visit.userId === user.uid) // Filtra visitas do usuário autenticado
      .map((visit) => ({
        ...visit,
        dataAtividade: new Date(visit.dataAtividade), // Garante que é um objeto Date
      }))
      .sort((a, b) => b.dataAtividade.getTime() - a.dataAtividade.getTime()); // Ordena em ordem crescente
  
    return sortedVisits.reduce((acc: { [key: string]: { [key: string]: Visit[] } }, visit) => {
      const date = visit.dataAtividade;
      const monthYearKey = `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`; // Formata como "MM/YYYY"
      const dayKey = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`; // Formata como "dd/mm/aaaa"
  
      if (!acc[monthYearKey]) {
        acc[monthYearKey] = {};
      }
      if (!acc[monthYearKey][dayKey]) {
        acc[monthYearKey][dayKey] = [];
      }
      acc[monthYearKey][dayKey].push(visit);
      return acc;
    }, {});
  };

  const renderGroupedVisits = () => {
  const groupedVisits = groupVisitsByMonthAndDay(visits);

  return Object.entries(groupedVisits).map(([monthYear, days]) => (
    <View key={monthYear} style={mainStyles.dateGroup}>
      <Text
        style={mainStyles.dateHeader}
        onPress={() => toggleDateGroup(monthYear)} // Alterna a expansão ao clicar no mês/ano
      >
        {monthYear} {/* Exibe o mês e ano */}
      </Text>
      {expandedDates[monthYear] && ( // Exibe os dias apenas se o grupo de mês/ano estiver expandido
        <View>
          {Object.entries(days).map(([day, visits]) => (
            <View key={day} style={mainStyles.dateGroup}>
              <Text
                style={mainStyles.dateHeader}
                onPress={() => toggleDateGroup(day)} // Alterna a expansão ao clicar no dia
              >
                {day} {/* Exibe o dia no formato "dd/mm/aaaa" */}
              </Text>
              {expandedDates[day] && ( // Exibe as visitas apenas se o grupo de dia estiver expandido
                <View style={mainStyles.visitList}>
                  {visits.map((visit) => (
                    <View key={visit.id} style={mainStyles.visitItem}>
                      <Text style={mainStyles.visitText}>
                        Data: {visit.dataAtividade.toLocaleDateString("pt-BR")} {/* Exibe a data no formato "dd/mm/aaaa" */}
                      </Text>
                      <Text style={mainStyles.visitText}>Ciclo: {visit.cicloAno}</Text>
                      <Text style={mainStyles.visitText}>
                        Location: {visit.location.latitude}, {visit.location.longitude}
                      </Text>
                      <Text style={mainStyles.visitText}>Registered by: {visit.userName}</Text>
                      <CustomButton
                        title="Edit"
                        onPress={() => router.push(`/form?id=${visit.id}`)}
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
          ))}
        </View>
      )}
    </View>
  ));
};

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Visit",
      "Are you sure you want to delete this visit?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteVisit(id);
            Alert.alert("Deleted", "Visit has been deleted.");
          },
        },
      ]
    );
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
        await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(syncedVisits));
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
      <CustomButton title="Create New Visit" onPress={() => router.push("/form")} />
      <CustomButton title="Sync Visits" onPress={handleSync} />
    </View>
  );
};


export default Main;