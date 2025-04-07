import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { z } from "zod";

const DropdownWithLabel = ({
  label,
  options,
  validationSchema,
  onChangeValue,
  error,
  value,
}: {
  label: string;
  options: any[];
  validationSchema: z.ZodSchema<any>;
  onChangeValue: (value: any) => void;
  error?: string;
  value?: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(options);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value); // Atualize o valor interno quando `value` mudar
  }, [value]);

  const handleChange = (value: any) => {
    setInternalValue(value);
    onChangeValue(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <DropDownPicker
        open={open}
        value={internalValue ?? null}
        items={items}
        setOpen={setOpen}
        setValue={handleChange}
        setItems={setItems}
        style={[styles.dropdown, error ? styles.dropdownError : null]}
        dropDownContainerStyle={{
          position: "absolute", // Posicionamento absoluto
          top: 20, // Ajuste conforme sua altura de componente
          width: "100%",
          zIndex: 1000,
        }}
        listMode="MODAL" // Abre em modal separado (evita conflito)
        modalProps={{
          animationType: "fade",
        }}
        modalContentContainerStyle={{
          backgroundColor: "white",
        }}
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
  dropdown: {
    borderColor: "#ccc",
  },
  dropdownError: {
    borderColor: "red",
  },
  error: {
    marginTop: 5,
    color: "red",
    fontSize: 14,
  },
});

export default DropdownWithLabel;
