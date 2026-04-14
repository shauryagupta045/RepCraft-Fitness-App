import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AIHomeScreen, AIChatScreen } from '../screens/ai/AIScreens';
import {
  WorkoutPlannerScreen,
  DietPlannerScreen,
  ProgressAnalyzerScreen,
  RoutineOptimizerScreen,
} from '../screens/ai/PlannerScreens';
import DietScreen from '../screens/diet/DietScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const AIStack_Nav = createStackNavigator();
const DietStack_Nav = createStackNavigator();
const ProfileStack_Nav = createStackNavigator();

export function AIStack() {
  return (
    <AIStack_Nav.Navigator screenOptions={{ headerShown: false }}>
      <AIStack_Nav.Screen name="AIHome" component={AIHomeScreen} />
      <AIStack_Nav.Screen name="AIChat" component={AIChatScreen} />
      <AIStack_Nav.Screen name="WorkoutPlanner" component={WorkoutPlannerScreen} />
      <AIStack_Nav.Screen name="DietPlanner" component={DietPlannerScreen} />
      <AIStack_Nav.Screen name="ProgressAnalyzer" component={ProgressAnalyzerScreen} />
      <AIStack_Nav.Screen name="RoutineOptimizer" component={RoutineOptimizerScreen} />
    </AIStack_Nav.Navigator>
  );
}

export function DietStack() {
  return (
    <DietStack_Nav.Navigator screenOptions={{ headerShown: false }}>
      <DietStack_Nav.Screen name="DietMain" component={DietScreen} />
    </DietStack_Nav.Navigator>
  );
}

export function ProfileStack() {
  return (
    <ProfileStack_Nav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack_Nav.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack_Nav.Navigator>
  );
}
