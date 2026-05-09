import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import NotificationScreen from '../screens/home/NotificationScreen';
import {
  WaterDetailScreen,
  SleepDetailScreen,
  StepDetailScreen,
  CaloriesDetailScreen,
  WorkoutWeekDetailScreen,
  ReadinessDetailScreen,
  DailyTargetsDetailScreen,
} from '../screens/home/DetailScreens';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="WaterDetail" component={WaterDetailScreen} />
      <Stack.Screen name="SleepDetail" component={SleepDetailScreen} />
      <Stack.Screen name="StepDetail" component={StepDetailScreen} />
      <Stack.Screen name="CaloriesDetail" component={CaloriesDetailScreen} />
      <Stack.Screen name="WorkoutWeekDetail" component={WorkoutWeekDetailScreen} />
      <Stack.Screen name="ReadinessDetail" component={ReadinessDetailScreen} />
      <Stack.Screen name="DailyTargetsDetail" component={DailyTargetsDetailScreen} />
    </Stack.Navigator>
  );
}
