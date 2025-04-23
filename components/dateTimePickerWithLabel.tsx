import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateTimePickerWithLabelProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

const DateTimePickerWithLabel: React.FC<DateTimePickerWithLabelProps> = ({ label, value, onChange }) => {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date | undefined) => {
    setShowDate(false);
    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      currentDate.setHours(value.getHours());
      currentDate.setMinutes(value.getMinutes());
      onChange(currentDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date | undefined) => {
    setShowTime(false);
    if (selectedTime) {
      const currentTime = new Date(value);
      currentTime.setHours(selectedTime.getHours());
      currentTime.setMinutes(selectedTime.getMinutes());
      onChange(currentTime);
    }
  };



  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Button onPress={() => setShowDate(true)} title={`Dia: ${value.toLocaleDateString()}`} />
      <Button onPress={() => setShowTime(true)} title={`Hora: ${value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`} />
      {showDate && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showTime && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          is24Hour={true}
        />
      )}
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
});

export default DateTimePickerWithLabel;