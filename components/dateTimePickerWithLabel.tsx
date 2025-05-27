import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import theme from "../app/styles/theme";
import formStyles from "@/app/styles/form.styles";

interface DateTimePickerWithLabelProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

const DateTimePickerWithLabel: React.FC<DateTimePickerWithLabelProps> = ({
  label,
  value,
  onChange,
}) => {
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
      <Text style={formStyles.label}>{label}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowDate(true)}
        >
          <Text style={styles.buttonText}>
            Dia: {value.toLocaleDateString("pt-BR")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTime(true)}
        >
          <Text style={styles.buttonText}>
            Hora: {value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
          </Text>
        </TouchableOpacity>
      </View>
      {showDate && (
        <DateTimePicker
          value={value}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
        />
      )}
      {showTime && (
        <DateTimePicker
          value={value}
          mode="time"
          display="spinner"
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    marginRight: 8,
    marginBottom: 4,
    elevation: 2,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DateTimePickerWithLabel;