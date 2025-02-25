import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./components/login";
import Main from "./components/main";
import Form from "./components/form";
import SignUp from "./components/signUp"; // Import the new SignUp component

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Form: undefined;
  SignUp: undefined; 
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Index() {
  return (
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Form" component={Form} />
        <Stack.Screen name="SignUp" component={SignUp} />
      </Stack.Navigator>
  );
}