import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Profiles
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreens from '../screens/profile/SettingsScreens';

// AI
import AIScreens from '../screens/ai_features/AIScreens';
import PlannerScreens from '../screens/ai_features/PlannerScreens';
import FormTrackerScreen from '../screens/ai_features/FormTrackerScreen';

// Diet
import DietScreen from '../screens/diet/DietScreen';
import FoodDiaryScreen from '../screens/diet/FoodDiaryScreen';
import LogFoodScreen from '../screens/diet/LogFoodScreen';
import FoodDetailScreen from '../screens/diet/FoodDetailScreen';
import ScannerScreen from '../screens/diet/ScannerScreen';
import ScanResultsScreen from '../screens/diet/ScanResultsScreen';
import UpdateTargetsScreen from '../screens/diet/UpdateTargetsScreen';

const Stack = createStackNavigator();

export const DietStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DietMain">
    <Stack.Screen name="DietMain" component={DietScreen} />
    <Stack.Screen name="FoodDiary" component={FoodDiaryScreen} />
    <Stack.Screen name="LogFood" component={LogFoodScreen} />
    <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
    <Stack.Screen name="Scanner" component={ScannerScreen} />
    <Stack.Screen name="ScanResults" component={ScanResultsScreen} />
    <Stack.Screen name="UpdateTargets" component={UpdateTargetsScreen} />
  </Stack.Navigator>
);

export const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreens} />
  </Stack.Navigator>
);

export const AIStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AIMain" component={AIScreens} />
    <Stack.Screen name="Planner" component={PlannerScreens} />
    <Stack.Screen name="FormTracker" component={FormTrackerScreen} />
  </Stack.Navigator>
);
