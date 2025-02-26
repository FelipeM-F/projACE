import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import CustomButton from "../../assets/CustomButton";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { RootStackParamList } from "../index";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Header</Text>
        <CustomButton title="Logout" onPress={handleLogout} color="#dc3545" textColor="#fff" />
      </View>
      <View style={styles.content}>
        {children}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Footer</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: "#007bff",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    height: 60,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default BaseLayout;