import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import theme from "../app/styles/theme";

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  color?: string; // Background color
  textColor?: string; // Text color
  style?: ViewStyle; // Additional styles for the button
  textStyle?: TextStyle; // Additional styles for the text
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  color = theme.colors.primary,
  textColor = theme.colors.white,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { color: textColor }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: theme.borderRadius.small,
    elevation: 3, // For Android shadow
    marginVertical: theme.spacing.small
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "600",
  },
});

export default CustomButton;