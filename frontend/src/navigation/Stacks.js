import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Profiles
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import { 
  SettingsMainScreen, 
  NotificationSettingsScreen, 
  UnitSettingsScreen, 
  InformationScreen 
} from '../screens/profile/SettingsScreens';

// AI
import { AIHomeScreen, AIChatScreen } from '../screens/ai_features/AIScreens';
import { 
  WorkoutPlannerScreen, 
  DietPlannerScreen, 
  ProgressAnalyzerScreen, 
  RoutineOptimizerScreen 
} from '../screens/ai_features/PlannerScreens';
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
    <Stack.Screen name="Settings" component={SettingsMainScreen} />
    <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
    <Stack.Screen name="UnitSettings" component={UnitSettingsScreen} />
    <Stack.Screen name="Information" component={InformationScreen} />
  </Stack.Navigator>
);

export const AIStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AIMain" component={AIHomeScreen} />
    <Stack.Screen name="AIChat" component={AIChatScreen} />
    <Stack.Screen name="WorkoutPlanner" component={WorkoutPlannerScreen} />
    <Stack.Screen name="DietPlanner" component={DietPlannerScreen} />
    <Stack.Screen name="FormTracker" component={FormTrackerScreen} />
    <Stack.Screen name="ProgressAnalyzer" component={ProgressAnalyzerScreen} />
    <Stack.Screen name="RoutineOptimizer" component={RoutineOptimizerScreen} />
  </Stack.Navigator>
);

