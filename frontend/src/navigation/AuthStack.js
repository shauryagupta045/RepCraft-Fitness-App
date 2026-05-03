import React from 'react';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import SplashScreen from '../screens/auth/SplashScreen';
import IntroScreen from '../screens/auth/IntroScreen';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import SetupFlowScreen from '../screens/auth/SetupFlowScreen';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid }}
      />
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SetupFlow" component={SetupFlowScreen} />
    </Stack.Navigator>
  );
}
