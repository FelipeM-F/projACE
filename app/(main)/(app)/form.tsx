import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Alert, ScrollView } from "react-native";
import TextInputWithLabel from "../../../components/textInputWithLabel";
import DropdownWithLabel from "../../../components/dropdownWithLabel";
import DateTimePickerWithLabel from "../../../components/dateTimePickerWithLabel";
import LocationInfo from "../../../components/location-info";
import { z } from "zod";
import { useVisitContext } from "./context/VisitContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const Form = () => {
  const [name, setName] = useState("");
  const [activity, setActivity] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { visits, addVisit, updateVisit } = useVisitContext();
  const router = useRouter();
  const { id } = useLocalSearchParams();


  const nameSchema = z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" });
  const activitySchema = z.enum(["1", "2", "3", "4", "5", "6"], {
    errorMap: () => ({ message: "Please select a valid activity" }),
  });

  useEffect(() => {
    if (id) {
      const visit = visits.find((v) => v.id === id);
      if (visit) {
        setName(visit.name);
        setActivity(visit.activity);
        setDate(new Date(visit.date));
        setLocation(visit.location);
      }
    }
  }, [id]);

  const handleSubmit = async () => {
    try {
      nameSchema.parse(name);
      activitySchema.parse(activity);

      const visitData = {
        id: Array.isArray(id) ? id[0]: id || uuidv4(),
        name,
        activity: activity!,
        date,
        location,
      };

      if (id) {
        await updateVisit(id as string, visitData);
        Alert.alert("Success", "Visit updated successfully!");
      } else {
        await addVisit(visitData);
        Alert.alert("Success", "Visit saved successfully!");
      }
  
      router.push("/main");
    } catch (e) {
      const newErrors: { [key: string]: string } = {};
      if (e instanceof z.ZodError) {
        e.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
      } else {
        newErrors.general = (e as Error).message;
      }
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
        value={name}
      />
      <DropdownWithLabel
        label="Activity"
        options={[
          { label: "1- LI", value: "1" },
          { label: "2- LI+T", value: "2" },
          { label: "3- PE", value: "3" },
          { label: "4- T", value: "4" },
          { label: "5- DF", value: "5" },
          { label: "6- PVE", value: "6" },
        ]}
        validationSchema={activitySchema}
        onChangeValue={(value) => {
          setActivity(value);
          setErrors((prev) => ({ ...prev, activity: "" }));
        }}
        error={errors.activity}
        value={activity}
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
