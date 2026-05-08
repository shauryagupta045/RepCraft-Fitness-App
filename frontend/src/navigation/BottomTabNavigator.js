import React from 'react';
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import WorkoutStack from './WorkoutStack';
import { AIStack, DietStack, ProfileStack } from './Stacks';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const CustomTabBarButton = ({ children, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.aiTabWrapper}
    >
      <View style={[styles.aiTabBtn, focused && styles.aiTabBtnActive]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};


function TabIcon({ name, focused, label, library = 'Ionicons', imageSource }) {
  const IconComponent = library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={styles.tabIconContainer}>
      {imageSource ? (
        <Image 
          source={imageSource} 
          style={{ 
            width: 22, 
            height: 22, 
            tintColor: focused ? COLORS.activeTab : COLORS.textMuted,
            resizeMode: 'contain'
          }} 
        />
      ) : (
        <IconComponent
          name={focused ? name.replace('-outline', '') : name}
          size={22}
          color={focused ? COLORS.activeTab : COLORS.textMuted}
        />
      )}
      <Text style={[styles.tabLabel, { color: focused ? COLORS.activeTab : COLORS.textMuted }]}>
        {label}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: COLORS.tabBar,
          height: Platform.OS === 'ios' ? 85 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          borderTopWidth: 0,
          ...SHADOWS.tab,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} label="Home" /> }} />
      <Tab.Screen name="Workout" component={WorkoutStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="barbell-outline" focused={focused} label="Workout" /> }} />
      <Tab.Screen name="AI" component={AIStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image 
              source={require('../../assets/ai-bot.png')}
              style={{ 
                width: focused ? 28 : 24, 
                height: focused ? 28 : 24, 
                tintColor: focused ? COLORS.surface : COLORS.textMuted,
                resizeMode: 'contain'
              }} 
            />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} />
          )
        }}
      />
      <Tab.Screen name="DietTab" component={DietStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="nutrition-outline" focused={focused} label="Diet" /> }} />
      <Tab.Screen name="Profile" component={ProfileStack}
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} label="Profile" /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  tabLabel: { fontFamily: FONTS.medium, fontSize: 10, marginTop: 3 },
  activeDot: { position: 'absolute', bottom: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.activeTab },
  aiTabWrapper: { alignItems: 'center', justifyContent: 'center', marginTop: -20 },
  aiTabBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.border, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.12)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 } }) },
  aiTabBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(232,112,94,0.45)' }, default: { shadowColor: COLORS.primary, shadowOpacity: 0.45 } }) },
});
