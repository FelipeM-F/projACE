import { StyleSheet } from "react-native";
import theme from "./theme";

const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.large,
    backgroundColor: theme.colors.light,
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.large,
    textAlign: "center",
  },
  dateGroup: {
    marginBottom: theme.spacing.large,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: theme.borderRadius.small,
    elevation: 3,
    padding: theme.spacing.medium,
  },
  dateHeader: {
    fontSize: theme.fontSizes.large,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  visitList: {
    marginLeft: theme.spacing.medium,
  },
  visitItem: {
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.muted,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: theme.borderRadius.small,
    elevation: 2,
  },
  visitText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
});

export default mainStyles;