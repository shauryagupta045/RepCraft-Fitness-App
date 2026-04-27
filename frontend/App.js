/**
 * RepCraft App.js — SDK 51 compatible, Expo Go + Web
 * Clean single NavigationContainer, no import.meta, no Alert
 */
import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  DMSans_900Black,
} from '@expo-google-fonts/dm-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// ─── Auth ──────────────────────────────────────────────────────────────
import SplashScreen     from './src/screens/auth/SplashScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import LoginScreen      from './src/screens/auth/LoginScreen';
import SignupScreen     from './src/screens/auth/SignupScreen';

// ─── Home ──────────────────────────────────────────────────────────────
import HomeScreen from './src/screens/home/HomeScreen';
import {
  WaterDetailScreen,
  SleepDetailScreen,
  StepDetailScreen,
  CaloriesDetailScreen,
  WorkoutWeekDetailScreen,
  ReadinessDetailScreen,
  DailyTargetsDetailScreen,
} from './src/screens/home/DetailScreens';

// ─── Workout ───────────────────────────────────────────────────────────
import WorkoutScreen        from './src/screens/workout/WorkoutScreen';
import ActiveWorkoutScreen  from './src/screens/workout/ActiveWorkoutScreen';
import ExerciseDetailScreen from './src/screens/workout/ExerciseDetailScreen';
import {
  RoutineBuilderScreen,
  ExerciseLibraryScreen,
} from './src/screens/workout/RoutineBuilderScreen';
import ExerciseHistoryScreen from './src/screens/workout/ExerciseHistoryScreen';

// ─── AI ────────────────────────────────────────────────────────────────
import { AIHomeScreen, AIChatScreen } from './src/screens/ai/AIScreens';
import {
  WorkoutPlannerScreen,
  DietPlannerScreen,
  ProgressAnalyzerScreen,
  RoutineOptimizerScreen,
} from './src/screens/ai/PlannerScreens';
import FormTrackerScreen from './src/screens/ai/FormTrackerScreen';

// ─── Diet & Profile ────────────────────────────────────────────────────
import DietScreen    from './src/screens/diet/DietScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import { 
  SettingsMainScreen,
  NotificationSettingsScreen,
  UnitSettingsScreen,
  InformationScreen 
} from './src/screens/profile/SettingsScreens';

// ─── Store & Theme ─────────────────────────────────────────────────────
import { useAuthStore } from './src/store/authStore';
import { COLORS, FONTS, SHADOWS } from './src/constants/theme';

// ─── Navigators ────────────────────────────────────────────────────────
const Root       = createStackNavigator();
const AuthStack  = createStackNavigator();
const HomeStack  = createStackNavigator();
const WkStack    = createStackNavigator();
const AiStack    = createStackNavigator();
const DietStack  = createStackNavigator();
const ProfStack  = createStackNavigator();
const Tabs       = createBottomTabNavigator();

// Suppress deprecated shadow* warnings from @react-navigation/stack on web
const NO_HEADER = { headerShown: false };
const WEB_SAFE_STACK_OPTS = Platform.OS === 'web'
  ? { headerShown: false, cardShadowEnabled: false, cardStyle: { backgroundColor: 'transparent' } }
  : NO_HEADER;

// ─── Auth navigator ────────────────────────────────────────────────────
function Auth() {
  return (
    <AuthStack.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      <AuthStack.Screen name="Splash"     component={SplashScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login"      component={LoginScreen} />
      <AuthStack.Screen name="Signup"     component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Home navigator ────────────────────────────────────────────────────
function Home() {
  return (
    <HomeStack.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      <HomeStack.Screen name="HomeMain"          component={HomeScreen} />
      <HomeStack.Screen name="WaterDetail"       component={WaterDetailScreen} />
      <HomeStack.Screen name="SleepDetail"       component={SleepDetailScreen} />
      <HomeStack.Screen name="StepDetail"        component={StepDetailScreen} />
      <HomeStack.Screen name="CaloriesDetail"    component={CaloriesDetailScreen} />
      <HomeStack.Screen name="WorkoutWeekDetail" component={WorkoutWeekDetailScreen} />
      <HomeStack.Screen name="ReadinessDetail"   component={ReadinessDetailScreen} />
      <HomeStack.Screen name="DailyTargetsDetail" component={DailyTargetsDetailScreen} />
    </HomeStack.Navigator>
  );
}

// ─── Workout navigator ─────────────────────────────────────────────────
function Workout() {
  return (
    <WkStack.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      <WkStack.Screen name="WorkoutMain"     component={WorkoutScreen} />
      <WkStack.Screen name="RoutineBuilder"  component={RoutineBuilderScreen} />
      <WkStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
      <WkStack.Screen name="ExerciseDetail"  component={ExerciseDetailScreen} />
      <WkStack.Screen name="ExerciseHistory" component={ExerciseHistoryScreen} />
      <WkStack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ gestureEnabled: false, ...WEB_SAFE_STACK_OPTS }}
      />
    </WkStack.Navigator>
  );
}

// ─── AI navigator ──────────────────────────────────────────────────────
function AI() {
  return (
    <AiStack.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      <AiStack.Screen name="AIHome"           component={AIHomeScreen} />
      <AiStack.Screen name="AIChat"           component={AIChatScreen} />
      <AiStack.Screen name="WorkoutPlanner"   component={WorkoutPlannerScreen} />
      <AiStack.Screen name="DietPlanner"      component={DietPlannerScreen} />
      <AiStack.Screen name="ProgressAnalyzer" component={ProgressAnalyzerScreen} />
      <AiStack.Screen name="RoutineOptimizer" component={RoutineOptimizerScreen} />
      <AiStack.Screen name="FormTracker"      component={FormTrackerScreen} />
    </AiStack.Navigator>
  );
}

// ─── Diet navigator ────────────────────────────────────────────────────
function Diet() {
  return (
    <DietStack.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      <DietStack.Screen name="DietMain" component={DietScreen} />
    </DietStack.Navigator>
  );
}


// ─── Profile navigator ─────────────────────────────────────────────────
function Profile() {
  return (
    <ProfStack.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      <ProfStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfStack.Screen name="SettingsMain" component={SettingsMainScreen} />
      <ProfStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <ProfStack.Screen name="UnitSettings" component={UnitSettingsScreen} />
      <ProfStack.Screen name="Information" component={InformationScreen} />
    </ProfStack.Navigator>
  );
}

// ─── Tab icon ──────────────────────────────────────────────────────────
function TabIcon({ iconName, label, focused }) {
  const color = focused ? COLORS.primary : '#9BA3AF';
  return (
    <View style={tabStyles.iconWrap}>
      <Ionicons
        name={focused ? iconName.replace('-outline', '') : iconName}
        size={22}
        color={color}
      />
      <Text style={[tabStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

// ─── AI tab center button ──────────────────────────────────────────────
function AITabIcon({ focused }) {
  return (
    <View style={tabStyles.aiOuter}>
      <View style={[tabStyles.aiInner, focused && tabStyles.aiInnerActive]}>
        <Ionicons
          name="hardware-chip-outline"
          size={23}
          color={focused ? '#fff' : '#9BA3AF'}
        />
      </View>
    </View>
  );
}

// ─── Main tabs ────────────────────────────────────────────────────────
function MainApp() {
  const tabBarHeight = Platform.OS === 'ios' ? 84 : 64;

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          // Web shadow
          ...SHADOWS.tab,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home-outline" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Workout"
        component={Workout}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="barbell-outline" label="Workout" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="AI"
        component={AI}
        options={{
          tabBarIcon: ({ focused }) => <AITabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Diet"
        component={Diet}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="nutrition-outline" label="Diet" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="person-outline" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}

// ─── Root navigator (auth gate) ────────────────────────────────────────
function RootNav() {
  const { isAuthenticated } = useAuthStore();
  return (
    <Root.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      {isAuthenticated ? (
        <Root.Screen name="MainApp" component={MainApp} />
      ) : (
        <Root.Screen name="Auth" component={Auth} />
      )}
    </Root.Navigator>
  );
}

// ─── Entry point ───────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSans_900Black,
  });

  // Show blank screen while fonts load (not a splash — splash is a screen)
  if (!fontsLoaded && !fontError) {
    if (Platform.OS === 'web') {
       return (
         <View style={{ height: '100vh', backgroundColor: '#1E2340', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white' }}>Loading Fonts...</Text>
         </View>
       );
    }
    return <View style={{ flex: 1, backgroundColor: '#1E2340' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNav />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ─── Tab bar styles ────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    marginTop: 3,
  },
  aiOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    // Lift button above tab bar
    marginBottom: Platform.OS === 'ios' ? 16 : 12,
  },
  aiInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E8EDF3',
    // Shadow — web-safe
    ...SHADOWS.card,
  },
  aiInnerActive: {
    backgroundColor: '#E8705E',
    borderColor: '#E8705E',
    ...SHADOWS.primary,
  },
});
