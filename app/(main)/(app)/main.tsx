import React from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import { useVisitContext } from "./context/VisitContext";
import { useRouter } from "expo-router";

const Main = () => {
  const { visits, deleteVisit, syncVisits } = useVisitContext();
  const router = useRouter();

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
      await syncVisits();
      Alert.alert("Success", "Visits synchronized with Firestore!");
    } catch (error) {
      console.error("Error syncing visits:", error);
    }
  };

  const renderVisit = ({ item }: { item: any }) => (
    <View style={styles.visitItem}>
      <Text style={styles.visitText}>Name: {item.name}</Text>
      <Text style={styles.visitText}>Activity: {item.activity}</Text>
      <Text style={styles.visitText}>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.visitText}>
        Location: {item.location.latitude}, {item.location.longitude}
      </Text>
      <Button title="Edit" onPress={() => router.push(`/form?id=${item.id}`)} />
      <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registered Visits</Text>
      <FlatList
        data={visits}
        keyExtractor={(item) => item.id}
        renderItem={renderVisit}
      />
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
  visitItem: {
    marginBottom: 20,
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