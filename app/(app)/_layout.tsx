import { Stack, useRouter, useSegments } from "expo-router";
import { View } from "react-native";
import CustomButton from "../../components/CustomButton";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import globalStyles from "../styles/globalStyles";
import theme from "../styles/theme";
import VisitProvider from "./context/VisitContext";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  const isMainScreen = segments[segments.length - 1] === "main";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/");
    } catch (error) {
      console.error("Erro ao desconectar o usuário: ", error);
    }
  };

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.header}>
        {!isMainScreen && (
          <CustomButton
            title="Voltar"
            onPress={() => router.back()}
            style={{
              backgroundColor: theme.colors.success,
              paddingVertical: theme.spacing.tiny,
              paddingHorizontal: theme.spacing.small,
            }}
            textStyle={{
              fontSize: theme.fontSizes.small,
            }}
          />
        )}
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          color={theme.colors.danger}
          textColor={theme.colors.white}
          style={{
            paddingVertical: theme.spacing.tiny,
            paddingHorizontal: theme.spacing.small,
          }}
          textStyle={{
            fontSize: theme.fontSizes.small,
          }}
        />
      </View>
      <View style={globalStyles.container}>{children}</View>
    </View>
  );
};

export default function AppLayout() {
  return (
    <BaseLayout>
    <VisitProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </VisitProvider>
    </BaseLayout>
  );
}
