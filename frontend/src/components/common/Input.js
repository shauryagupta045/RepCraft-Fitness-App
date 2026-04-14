import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  multiline,
  numberOfLines,
  style,
  inputStyle,
  editable = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.container,
          focused && styles.focused,
          error && styles.errorBorder,
        ]}
      >
        {leftIcon ? (
          <View style={styles.iconLeft}>{leftIcon}</View>
        ) : null}
        <TextInput
          style={[
            styles.input,
            leftIcon && { paddingLeft: 4 },
            multiline && { minHeight: numberOfLines ? numberOfLines * 24 : 80 },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconRight}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.card,
  },
  focused: { borderColor: COLORS.primary },
  errorBorder: { borderColor: COLORS.danger },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textDark,
    paddingVertical: 14,
  },
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8, padding: 2 },
  error: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },
});
