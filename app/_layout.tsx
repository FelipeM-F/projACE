import { Stack } from 'expo-router';
import VisitProvider, { Visit } from './(app)/context/VisitContext';

export default function RootLayout() {
  return (
    <VisitProvider>
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="signUp" />
    </Stack>
    </VisitProvider>
  );
}