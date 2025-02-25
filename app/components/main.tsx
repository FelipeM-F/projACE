import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../index";

type FormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Form'>;

const Main = () => {

  const navigation = useNavigation<FormScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <Text>Welcome to the Main Page!</Text>
      <Button title="Open Form" onPress={() => navigation.navigate("Form")} />
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