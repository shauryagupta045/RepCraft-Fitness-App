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
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebase';

// ─── Auth ──────────────────────────────────────────────────────────────
import SplashScreen      from './src/screens/auth/SplashScreen';
import IntroScreen       from './src/screens/auth/IntroScreen';
import AuthLandingScreen from './src/screens/auth/AuthLandingScreen';
import SetupFlowScreen   from './src/screens/auth/SetupFlowScreen';
import LoginScreen       from './src/screens/auth/LoginScreen';
import SignupScreen      from './src/screens/auth/SignupScreen';

// ─── Home ──────────────────────────────────────────────────────────────
import {
  DailyTargetsDetailScreen,
} from './src/screens/home/DetailScreens';

// ─── AI ────────────────────────────────────────────────────────────────
import FormTrackerScreen from './src/screens/ai_features/FormTrackerScreen';

// ─── Diet & Profile ────────────────────────────────────────────────────


// ─── Store & Theme ─────────────────────────────────────────────────────
import { useAuthStore } from './src/store/authStore';
import { COLORS, FONTS, SHADOWS } from './src/constants/theme';

// ─── Navigators ────────────────────────────────────────────────────────
import HomeStack from './src/navigation/HomeStack';
import WorkoutStack from './src/navigation/WorkoutStack';
import { AIStack, DietStack, ProfileStack } from './src/navigation/Stacks';

const Root       = createStackNavigator();
const Tabs       = createBottomTabNavigator();

// Suppress deprecated shadow* warnings from @react-navigation/stack on web
const NO_HEADER = { headerShown: false };
const WEB_SAFE_STACK_OPTS = Platform.OS === 'web'
  ? { headerShown: false, cardShadowEnabled: false, cardStyle: { backgroundColor: 'transparent' } }
  : NO_HEADER;

// ─── Auth navigator ────────────────────────────────────────────────────
const AuthS = createStackNavigator();
function Auth() {
  return (
    <AuthS.Navigator screenOptions={WEB_SAFE_STACK_OPTS}>
      <AuthS.Screen name="Splash"      component={SplashScreen} />
      <AuthS.Screen name="Intro"       component={IntroScreen} />
      <AuthS.Screen name="AuthLanding" component={AuthLandingScreen} />
      <AuthS.Screen name="Login"       component={LoginScreen} />
      <AuthS.Screen name="Signup"      component={SignupScreen} />
      <AuthS.Screen name="SetupFlow"   component={SetupFlowScreen} />
    </AuthS.Navigator>
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
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home-outline" label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Workout"
        component={WorkoutStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="barbell-outline" label="Workout" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="AI"
        component={AIStack}
        options={{
          tabBarIcon: ({ focused }) => <AITabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Diet"
        component={DietStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="nutrition-outline" label="Diet" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileStack}
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
  const { setUser } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSans_900Black,
  });

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('[App] Auth state changed: User detected', user.uid);
        try {
          await setUser(user);
        } catch (err) {
          console.error('[App] setUser error:', err);
        }
      } else {
        console.log('[App] Auth state changed: No user');
        // If we were authenticated but Firebase says no user, log out locally
        const { isAuthenticated, logout } = useAuthStore.getState();
        if (isAuthenticated) {
          console.log('[App] Local state was authenticated, performing logout');
          await logout();
        }
      }
    });
    return unsubscribe;
  }, [setUser]);

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
