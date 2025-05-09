import { StyleSheet } from "react-native";
import theme from "./theme";

const formStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    padding: theme.spacing.large,
    backgroundColor: theme.colors.light,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    marginTop: theme.spacing.medium,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.white,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.tiny,
  },
});

export default formStyles;