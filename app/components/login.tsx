import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import TextInputWithLabel from "./textInputWithLabel";
import { z } from "zod";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../index";
import CustomButton from "../../assets/CustomButton";



type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const emailSchema = z.string().email({ message: "Invalid email address" });
  const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters long" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuário já está autenticado:", user.email);
        navigation.replace("Main");
      } else {
        console.log("Nenhum usuário logado.");
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [navigation]);

  const handleLogin = async () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      console.log("Attempting to log in with email:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Login successful:", user.email);
      navigation.replace("Main"); 
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        e.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
        console.log("Validation errors:", newErrors);
      } else {
        console.log("Login failed:", (e as any).message);
        Alert.alert("Login Failed", (e as any).message);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInputWithLabel
        label="Email"
        placeholder="Enter your email"
        validationSchema={emailSchema}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: "" }));
        }}
        error={errors.email}
      />
      <TextInputWithLabel
        label="Password"
        placeholder="Enter your password"
        validationSchema={passwordSchema}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: "" }));
        }}
        error={errors.password}
      />
      <CustomButton title="Login" onPress={handleLogin} />
      <CustomButton
        title="Sign Up"
        onPress={() => navigation.navigate("SignUp")}
        color="#28a745"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Login;