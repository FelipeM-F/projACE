import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { z } from "zod";

const TextInputWithLabel = ({ label, placeholder, validationSchema, onChangeText, error }: { label: string; placeholder: string; validationSchema: any; onChangeText: (text: string) => void; error?: string }) => {
  const [value, setValue] = useState("");

  const handleChange = (text: string) => {
    setValue(text);
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChange}
        secureTextEntry = {label === "Password" ? true : false}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  inputError: {
    borderColor: "red",
  },
  error: {
    marginTop: 5,
    color: "red",
    fontSize: 14,
  },
});

export default TextInputWithLabel;