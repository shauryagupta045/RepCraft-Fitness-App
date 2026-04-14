import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

export default function Toast({ visible, message, type = 'success', onHide }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide && onHide());
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const configs = {
    success: { color: COLORS.success, icon: 'checkmark-circle', bg: '#1A1A2E' },
    error: { color: COLORS.danger, icon: 'close-circle', bg: '#1A1A2E' },
    info: { color: COLORS.secondary, icon: 'information-circle', bg: '#1A1A2E' },
  };
  const cfg = configs[type] || configs.success;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: cfg.bg, opacity, transform: [{ translateY }] },
        SHADOWS.primary,
      ]}
    >
      <Ionicons name={cfg.icon} size={20} color={cfg.color} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    zIndex: 9999,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#fff',
  },
});
