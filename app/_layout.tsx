import { Stack } from "expo-router";
import VisitProvider from "./(app)/context/VisitContext";

export default function RootLayout() {
  return (
      <Stack
      screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signUp" />
      </Stack>
  );
}
