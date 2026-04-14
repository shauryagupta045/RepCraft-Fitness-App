import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | ghost
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes = { sm: 13, md: 15, lg: 17 };

  if (variant === 'primary') {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animStyle, styles.base, { opacity: disabled ? 0.5 : 1 }, style]}
        activeOpacity={1}
      >
        <LinearGradient
          colors={['#FF7D6B', '#FF9A8B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles[size]]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.primaryText, { fontSize: textSizes[size] }, textStyle]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  const variantStyles = {
    secondary: { backgroundColor: COLORS.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
    ghost: { backgroundColor: 'transparent' },
  };

  const variantTextStyles = {
    secondary: { color: COLORS.dark },
    outline: { color: COLORS.primary },
    ghost: { color: COLORS.primary },
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animStyle,
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        { opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? COLORS.dark : COLORS.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantTextStyles[variant], { fontSize: textSizes[size] }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  gradient: {
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  primaryText: {
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  text: {
    fontFamily: FONTS.bold,
  },
});
