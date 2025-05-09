import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import theme from "../app/styles/theme";

import PropTypes from "prop-types";

const RadioButtonPropTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedValue: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

type Option = {
  label: string;
  value: string;
};

type RadioButtonProps = {
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
};

const RadioButton: React.FC<RadioButtonProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.button,
            selectedValue === option.value && styles.selectedButton,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.label,
              selectedValue === option.value && styles.selectedLabel,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    paddingVertical: theme.spacing.small,
    paddingHorizontal: theme.spacing.medium,
    margin: theme.spacing.tiny,
    backgroundColor: theme.colors.light,
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
  },
  label: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
  },
  selectedLabel: {
    color: theme.colors.white,
  },
});

export default RadioButton;