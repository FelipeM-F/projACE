import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

const Main = () => {
  return (
    <View style={styles.container}>
      <Text>Welcome to the Main Page!</Text>
      <Link href="/form">Open Form</Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Main;