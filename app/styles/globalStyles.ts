import { StyleSheet } from "react-native";
import theme from "./theme";

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    height: 60,
    backgroundColor: theme.colors.primary,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: theme.spacing.medium,
  },
  headerText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
  },
  footer: {
    height: 60,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.medium,
  },
  button: {
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    marginTop: theme.spacing.medium,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: theme.colors.muted,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.medium,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.medium,
    backgroundColor: theme.colors.white,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.tiny,
  },
});

export default globalStyles;