import React from "react";
import { View, Text, StyleSheet, ScrollView, Button, Alert } from "react-native";
import { useVisitContext, Visit } from "./context/VisitContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { firestore } from "../../../firebaseConfig";
import { v4 as uuidv4 } from "uuid";

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

  const groupVisitsByDate = (visits: Visit[]) => {
    return visits.reduce((acc: { [key: string]: Visit[] }, visit) => {
      const dateKey = new Date(visit.date).toLocaleDateString(); // Formata a data como chave
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(visit);
      return acc;
    }, {});
  };

  const renderGroupedVisits = () => {
    const groupedVisits = groupVisitsByDate(visits);
  
    return Object.entries(groupedVisits).map(([date, visits]) => (
      <View key={date} style={styles.dateGroup}>
        <Text
          style={styles.dateHeader}
          onPress={() => toggleDateGroup(date)} // Alterna a expansão ao clicar na data
        >
          {date}
        </Text>
        {expandedDates[date] && ( // Exibe as visitas apenas se o grupo estiver expandido
          <View style={styles.visitList}>
            {visits.map((visit) => (
              <View key={visit.id} style={styles.visitItem}>
                <Text style={styles.visitText}>Name: {visit.name}</Text>
                <Text style={styles.visitText}>Activity: {visit.activity}</Text>
                <Text style={styles.visitText}>
                  Location: {visit.location.latitude}, {visit.location.longitude}
                </Text>
                <Text style={styles.visitText}>Registered by: {visit.userName}</Text>
                <Button
                  title="Edit"
                  onPress={() => router.push(`/form?id=${visit.id}`)}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDelete(visit.id)}
                  color="red"
                />
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
        syncVisits(); // Atualiza o estado global
      }

      Alert.alert("Success", "Visits synchronized with Firestore!");
    } catch (error) {
      console.error("Error syncing visits:", error);
      Alert.alert("Error", "Failed to sync visits.");
    }
  };

  const renderVisit = ({ item }: { item: Visit }) => (
    <View style={styles.visitItem}>
      <Text style={styles.visitText}>Name: {item.name}</Text>
      <Text style={styles.visitText}>Activity: {item.activity}</Text>
      <Text style={styles.visitText}>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.visitText}>
        Location: {item.location.latitude}, {item.location.longitude}
      </Text>
      <Text style={styles.visitText}>Registered by: {item.userName}</Text>
      <Button title="Edit" onPress={() => router.push(`/form?id=${item.id}`)} />
      <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registered Visits</Text>
      <ScrollView>{renderGroupedVisits()}</ScrollView>
      <Button title="Create New Visit" onPress={() => router.push("/form")} />
      <Button title="Sync Visits" onPress={handleSync} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007bff",
    textDecorationLine: "underline", // Indica que é clicável
  },
  visitList: {
    marginLeft: 10, // Indenta a lista de visitas
  },
  visitItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  visitText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default Main;