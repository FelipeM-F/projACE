// import React from "react";
// import { createStackNavigator } from "@react-navigation/stack";
// import Login from "./components/login";
// import Main from "./components/main";
// import Form from "./components/form";
// import SignUp from "./components/signUp";
// import ProtectedRoute from "./components/protectedRoute";

// export type RootStackParamList = {
//   Login: undefined;
//   Main: undefined;
//   Form: undefined;
//   SignUp: undefined; 
// };

// const Stack = createStackNavigator<RootStackParamList>();

// export default function Index() {
//   return (
//     <Stack.Navigator initialRouteName="Login">
//       <Stack.Screen name="Login" component={Login} />
//       <Stack.Screen name="SignUp" component={SignUp} />
//       <Stack.Screen name="Main">
//         {() => (
//           <ProtectedRoute>
//             <Main />
//           </ProtectedRoute>
//         )}
//       </Stack.Screen>
//       <Stack.Screen name="Form" component={Form} />
//     </Stack.Navigator>
//   );
// }

import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <Link href="/main">Open Form</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
