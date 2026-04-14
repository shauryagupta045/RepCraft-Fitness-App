import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WorkoutScreen from '../screens/workout/WorkoutScreen';
import { RoutineBuilderScreen, ExerciseLibraryScreen } from '../screens/workout/RoutineBuilderScreen';
import ActiveWorkoutScreen from '../screens/workout/ActiveWorkoutScreen';
import ExerciseDetailScreen from '../screens/workout/ExerciseDetailScreen';
import ExerciseHistoryScreen from '../screens/workout/ExerciseHistoryScreen';

const Stack = createStackNavigator();

export default function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutMain" component={WorkoutScreen} />
      <Stack.Screen name="RoutineBuilder" component={RoutineBuilderScreen} />
      <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
