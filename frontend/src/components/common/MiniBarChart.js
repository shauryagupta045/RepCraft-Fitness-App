import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

const AnimatedBar = ({ value, maxValue, index, primaryColor, secondaryColor, isActive }) => {
  const height = useSharedValue(0);
  const targetHeight = maxValue > 0 ? (value / maxValue) * 60 : 0;

  useEffect(() => {
    height.value = withDelay(index * 50, withSpring(targetHeight, { damping: 14 }));
  }, [value, maxValue]);

  const animStyle = useAnimatedStyle(() => ({
    height: Math.max(height.value, 3),
  }));

  return (
    <Animated.View
      style={[
        styles.bar,
        animStyle,
        { backgroundColor: isActive ? primaryColor : secondaryColor },
      ]}
    />
  );
};

export default function MiniBarChart({
  data = [],
  labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  activeIndex = 5,
  primaryColor = COLORS.primary,
  secondaryColor = 'rgba(109,213,192,0.3)',
  height = 60,
}) {
  const maxValue = Math.max(...data, 1);

  return (
    <View style={[styles.container, { height: height + 20 }]}>
      <View style={[styles.bars, { height }]}>
        {data.map((val, i) => (
          <View key={i} style={styles.barWrapper}>
            <AnimatedBar
              value={val}
              maxValue={maxValue}
              index={i}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              isActive={i === activeIndex}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {labels.map((label, i) => (
          <Text
            key={i}
            style={[
              styles.label,
              { color: i === activeIndex ? primaryColor : COLORS.textMuted },
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 1.5,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 3,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 4,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    fontFamily: FONTS.medium,
  },
});
