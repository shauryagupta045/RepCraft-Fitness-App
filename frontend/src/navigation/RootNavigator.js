// ─── RootNavigator.js ─────────────────────────────────────────────────────────
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import BottomTabNavigator from './BottomTabNavigator';
import SetupFlowScreen from '../screens/auth/SetupFlowScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  // Check if profile is complete (e.g., has a goal)
  const isProfileComplete = user?.profile?.goal && user?.profile?.goal !== '';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          isProfileComplete ? (
            <Stack.Screen name="MainApp" component={BottomTabNavigator} />
          ) : (
            <Stack.Screen name="SetupFlow" component={SetupFlowScreen} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
