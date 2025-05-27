import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { z } from "zod";

const TextInputWithLabel = ({
  label,
  placeholder,
  validationSchema,
  onChangeText,
  error,
  value,
  keyboardType = "default", // Adicione aqui
}: {
  label: string;
  placeholder: string;
  validationSchema: any;
  onChangeText: (text: string) => void;
  error?: string;
  value?: string;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad"; // Adicione aqui
}) => {
  const [internalValue, setInternalValue] = useState(value || "");

  useEffect(() => {
    setInternalValue(value || ""); // Atualize o valor interno quando `value` mudar
  }, [value]);

  const handleChange = (text: string) => {
    setInternalValue(text);
    onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        value={internalValue}
        onChangeText={handleChange}
        secureTextEntry={label === "Password" ? true : false}
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
