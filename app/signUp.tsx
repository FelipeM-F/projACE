import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import TextInputWithLabel from "../components/textInputWithLabel";
import { z } from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Redirect } from "expo-router";
import CustomButton from "../components/CustomButton";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [redirectToMain, setRedirectToMain] = useState(false);

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
      setRedirectToMain(true);
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

  if (redirectToMain) {
    return <Redirect href="/main" />;
  }

  return (
    <View style={styles.container}>
      <TextInputWithLabel
        label="Emaillll"
        placeholder="Enter your email !!"
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
