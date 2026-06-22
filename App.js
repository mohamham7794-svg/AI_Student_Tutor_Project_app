import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { getToken } from './services/api';
import { COLORS } from './theme';

import LoginScreen from './screens/login_screen';
import RegisterScreen from './screens/register_screen';
import HomeScreen from './screens/home_screen';
import FormScreen from './screens/form_screen';
import ResultsScreen from './screens/results_screen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    (async () => {
      const token = await getToken();
      setInitialRoute(token ? 'Home' : 'Login');
      setCheckingAuth(false);
    })();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}