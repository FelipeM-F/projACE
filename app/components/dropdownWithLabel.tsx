import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { z } from "zod";

const DropdownWithLabel = ({ label, options, validationSchema, onChangeValue, error }: { label: string; options: any[]; validationSchema: z.ZodSchema<any>; onChangeValue: (value: any) => void; error?: string }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState(options);

const handleChange = (value: any) => {
    setValue(value);
    onChangeValue(value);
};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={handleChange}
        setItems={setItems}
        style={[styles.dropdown, error ? styles.dropdownError : null]}
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