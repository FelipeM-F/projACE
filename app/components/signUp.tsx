import React, { useState } from "react";
import { View, Button, StyleSheet, Alert } from "react-native";
import TextInputWithLabel from "./textInputWithLabel";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../index";
import CustomButton from "../../assets/CustomButton";
import BaseLayout from "./baseLayout";

type SignUpScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SignUp"
>;

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const emailSchema = z.string().email({ message: "Invalid email address" });
  const passwordSchema = z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" });

  const handleSignUp = async () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      Alert.alert("Sign Up Successful", `Welcome, ${user.email}`);
      navigation.navigate("Login");
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        e.errors.forEach((error) => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
      } else {
        Alert.alert("Sign Up Failed", (e as any).message);
      }
    }
  };

  return (
    <BaseLayout>
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
        <CustomButton title="Sign Up" onPress={handleSignUp} />
      </View>
    </BaseLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
});

export default SignUp;
