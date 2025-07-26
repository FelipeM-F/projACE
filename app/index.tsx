import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ActivityIndicator } from "react-native";
import TextInputWithLabel from "../components/TextInputWithLabel";
import { z } from "zod";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import CustomButton from "../components/CustomButton";
import { Redirect, useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const emailSchema = z.string().email({ message: "Invalid email address" });
  const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters long" });

  useEffect(() => {
    const checkLocalCredentials = async () => {
      try {
        const storedCredentials = await AsyncStorage.getItem("userCredentials");
        if (storedCredentials) {
          const { email: storedEmail, password: storedPassword } = JSON.parse(storedCredentials);
  
          // Verifica se as credenciais armazenadas correspondem às inseridas
          if (email === storedEmail && password === storedPassword) {
            console.log("Authenticated offline with stored credentials.");
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Error checking local credentials:", error);
      }
    };
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuário já está autenticado:", user.email);
        setIsAuthenticated(true);
      } else {
        console.log("Nenhum usuário logado.");
        checkLocalCredentials(); // Tenta autenticar offline
      }
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
  
      console.log("Attempting to log in with email:", email);
  
      try {
        // Tenta autenticar online
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        console.log("Login successful:", user.email);
  
        // Armazena as credenciais localmente
        await AsyncStorage.setItem(
          "userCredentials",
          JSON.stringify({ email, password })
        );
  
        setIsAuthenticated(true);
      } catch (onlineError) {
        console.log("Online login failed, attempting offline login...");
  
        // Tenta autenticar offline
        const storedCredentials = await AsyncStorage.getItem("userCredentials");
        if (storedCredentials) {
          const { email: storedEmail, password: storedPassword } = JSON.parse(storedCredentials);
  
          if (email === storedEmail && password === storedPassword) {
            console.log("Authenticated offline with stored credentials.");
            setIsAuthenticated(true);
          } else {
            throw new Error("Invalid credentials for offline login.");
          }
        } else {
          throw new Error("No stored credentials available for offline login.");
        }
      }
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

  if (isAuthenticated) {
    return <Redirect href="/main" />;
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
        onPress={() => router.push("/signUp")}
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