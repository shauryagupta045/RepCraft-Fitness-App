import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Card({
  children,
  onPress,
  style,
  padding = SPACING.lg,
  radius = RADIUS.card,
  color = COLORS.surface,
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        activeOpacity={1}
        style={[
          animStyle,
          styles.card,
          SHADOWS.card,
          { padding, borderRadius: radius, backgroundColor: color },
          style,
        ]}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <View
      style={[
        styles.card,
        SHADOWS.card,
        { padding, borderRadius: radius, backgroundColor: color },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
