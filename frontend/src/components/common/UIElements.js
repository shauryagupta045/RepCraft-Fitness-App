import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

export function ProgressBar({ value = 0, max = 100, color = COLORS.primary, height = 8, style }) {
  const width = useSharedValue(0);
  const pct = Math.min((value / max) * 100, 100);

  useEffect(() => {
    width.value = withSpring(pct, { damping: 18 });
  }, [pct]);

  const animStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View style={[{ height, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden' }, style]}>
      <Animated.View style={[{ height, backgroundColor: color, borderRadius: RADIUS.pill }, animStyle]} />
    </View>
  );
}

export function Badge({ label, color = COLORS.primary, textColor = '#fff', size = 'sm', style }) {
  const sizes = { sm: { px: 8, py: 3, fs: 11 }, md: { px: 12, py: 5, fs: 13 } };
  const s = sizes[size] || sizes.sm;
  return (
    <View style={[{
      backgroundColor: color,
      borderRadius: RADIUS.pill,
      paddingHorizontal: s.px,
      paddingVertical: s.py,
      alignSelf: 'flex-start',
    }, style]}>
      <Text style={{ fontFamily: FONTS.bold, fontSize: s.fs, color: textColor }}>{label}</Text>
    </View>
  );
}

export function TabSelector({ tabs, activeIndex, onSelect, style }) {
  return (
    <View style={[tsStyles.container, style]}>
      {tabs.map((tab, i) => (
        <View
          key={i}
          style={[tsStyles.tab, i === activeIndex && tsStyles.activeTab]}
        >
          <Text
            onPress={() => onSelect(i)}
            style={[tsStyles.tabText, i === activeIndex && tsStyles.activeTabText]}
          >
            {tab}
          </Text>
        </View>
      ))}
    </View>
  );
}

const tsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  activeTab: { backgroundColor: COLORS.surface },
  tabText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  activeTabText: { color: COLORS.textDark, fontFamily: FONTS.bold },
});

export function SkeletonLoader({ width = '100%', height = 20, radius = 8, style }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const interval = setInterval(() => {
      opacity.value = withSpring(opacity.value < 0.7 ? 0.7 : 0.4);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: COLORS.border,
          borderRadius: radius,
        },
        animStyle,
        style,
      ]}
    />
  );
}
