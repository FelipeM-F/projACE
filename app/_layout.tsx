import { Stack } from "expo-router";
import { VisitProvider } from "./(main)/(app)/context/VisitContext";

export default function RootLayout() {
  return (
    <VisitProvider>
      <Stack>
        <Stack.Screen name="(main)" />
      </Stack>
    </VisitProvider>
  );
}