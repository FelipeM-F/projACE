import React, { useState } from "react";
import { View, Button, StyleSheet, Alert, ScrollView } from "react-native";
import TextInputWithLabel from "../../../components/textInputWithLabel";
import DropdownWithLabel from "../../../components/dropdownWithLabel";
import DateTimePickerWithLabel from "../../../components/dateTimePickerWithLabel";
import LocationInfo from "../../../components/location-info";
import { z } from "zod";

const Form = () => {
  const [name, setName] = useState("");
  const [activity, setActivity] = useState(null);
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const nameSchema = z.string().min(2, { message: "Name must be at least 2 characters long" });
  const activitySchema = z.enum(["1", "2", "3", "4", "5", "6"], {
    errorMap: () => ({ message: "Please select a valid activity" }),
  });

  const activityOptions = [
    { label: "1- LI", value: "1" },
    { label: "2- LI+T", value: "2" },
    { label: "3- PE", value: "3" },
    { label: "4- T", value: "4" },
    { label: "5- DF", value: "5" },
    { label: "6- PVE", value: "6" },
  ];

  const handleSubmit = () => {
    try {
      nameSchema.parse(name);
      activitySchema.parse(activity);
      Alert.alert(
        "Form Submitted",
        `Name: ${name}\nActivity: ${activity}\nDate: ${date.toLocaleString()}\nLocation: ${location.latitude}, ${location.longitude}`
      );
    } catch (e) {
      const newErrors: { [key: string]: string } = {};
      (e as z.ZodError).errors.forEach((error) => {
        newErrors[error.path[0]] = error.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInputWithLabel
        label="Name"
        placeholder="Enter your name"
        validationSchema={nameSchema}
        onChangeText={(text) => {
          setName(text);
          setErrors((prev) => ({ ...prev, name: "" }));
        }}
        error={errors.name}
      />
      <DropdownWithLabel
        label="Atividade"
        options={activityOptions}
        validationSchema={activitySchema}
        onChangeValue={(value) => {
          setActivity(value);
          setErrors((prev) => ({ ...prev, activity: "" }));
        }}
        error={errors.activity}
      />
      <DateTimePickerWithLabel
        label="Date and Time"
        value={date}
        onChange={(selectedDate) => {
          setDate(selectedDate);
        }}
      />
      <LocationInfo onLocationUpdate={setLocation} />
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    justifyContent: "flex-start", 
    padding: 20,
  },
});

export default Form;