import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

// ─── ChatBubble ──────────────────────────────────────────────────────────────
export function ChatBubble({ message, userName }) {
  const isUser = message.role === 'user';
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) {
    return (
      <View style={styles.userBubbleRow}>
        <View style={styles.userBubbleContent}>
          <LinearGradient
            colors={['#FF7D6B', '#D96055']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.userBubble}
          >
            <Text style={styles.userBubbleText}>{message.text}</Text>
          </LinearGradient>
          {time ? <Text style={styles.timeLabel}>{time}</Text> : null}
        </View>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{(userName || 'U')[0].toUpperCase()}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.aiBubbleRow}>
      <View style={styles.aiAvatar}>
        <Ionicons name="hardware-chip-outline" size={16} color="#fff" />
      </View>
      <View style={styles.aiBubbleContent}>
        <View style={[styles.aiBubble, SHADOWS.card]}>
          <Text style={styles.aiBubbleText}>{message.text}</Text>
        </View>
        {time ? <Text style={styles.timeLabel}>{time}</Text> : null}
      </View>
    </View>
  );
}

// ─── AIActionCard ────────────────────────────────────────────────────────────
export function AIActionCard({ plan, onPreview, onSave }) {
  const isWorkout = plan?.workoutPlan;
  const isDiet = plan?.dietPlan;

  const icon = isWorkout ? 'barbell-outline' : isDiet ? 'nutrition-outline' : 'bulb-outline';
  const color = isWorkout ? COLORS.primary : COLORS.secondary;
  const title = isWorkout ? 'Workout Plan Generated' : isDiet ? 'Diet Plan Generated' : 'Plan Generated';
  const days = isWorkout ? plan.workoutPlan?.length : null;

  return (
    <View style={[styles.actionCard, SHADOWS.card]}>
      <View style={styles.actionHeader}>
        <View style={[styles.actionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.actionTitle}>{title}</Text>
          {days ? <Text style={styles.actionSub}>{days}-day program ready to review</Text> : null}
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.previewBtn} onPress={onPreview}>
          <Ionicons name="eye-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.previewBtnText}>Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: color }]} onPress={onSave}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Save to App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── SmartReplyChips ─────────────────────────────────────────────────────────
export function SmartReplyChips({ onSelect }) {
  const replies = [
    { text: 'Create a workout plan', icon: 'barbell-outline' },
    { text: 'Write a diet plan', icon: 'nutrition-outline' },
    { text: 'How much protein?', icon: 'flame-outline' },
    { text: 'Analyze progress', icon: 'stats-chart-outline' },
    { text: 'Get sleep tips', icon: 'moon-outline' },
  ];

  return (
    <View style={styles.chipsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {replies.map((reply, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onSelect(reply.text)}
            style={[styles.chip, SHADOWS.sm]}
            activeOpacity={0.7}
          >
            <Ionicons name={reply.icon} size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.chipText}>{reply.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── InsightCard ─────────────────────────────────────────────────────────────
export function InsightCard({ insight, onAction }) {
  const borderColor = insight.color || COLORS.secondary;

  return (
    <View style={[styles.insightCard, { borderLeftColor: borderColor }, SHADOWS.card]}>
      <View style={styles.insightHeader}>
        <View style={[styles.insightIcon, { backgroundColor: borderColor + '20' }]}>
          <Ionicons name={insight.icon || 'bulb-outline'} size={18} color={borderColor} />
        </View>
        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          {insight.stat ? (
            <View style={[styles.insightBadge, { backgroundColor: borderColor + '20' }]}>
              <Text style={[styles.insightBadgeText, { color: borderColor }]}>{insight.stat}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={styles.insightDesc}>{insight.description}</Text>
      {insight.action ? (
        <TouchableOpacity style={styles.insightAction} onPress={onAction}>
          <Text style={[styles.insightActionText, { color: borderColor }]}>{insight.action}</Text>
          <Ionicons name="chevron-forward" size={14} color={borderColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── TypingIndicator ─────────────────────────────────────────────────────────
export function TypingIndicator() {
  const [dots, setDots] = React.useState([0.3, 0.6, 1]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        const next = [...prev];
        next.push(next.shift());
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.aiBubbleRow}>
      <View style={styles.aiAvatar}>
        <Ionicons name="hardware-chip-outline" size={16} color={COLORS.primary} />
      </View>
      <View style={[styles.aiBubble, SHADOWS.card, { paddingVertical: 14 }]}>
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          {dots.map((opacity, i) => (
            <View
              key={i}
              style={[styles.typingDot, { opacity, backgroundColor: COLORS.primary }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ChatBubble
  userBubbleRow: { flexDirection: 'row-reverse', alignItems: 'flex-end', marginBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  userBubbleContent: { alignItems: 'flex-end', maxWidth: '75%', marginRight: SPACING.sm },
  userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontFamily: FONTS.bold, fontSize: 13, color: '#fff' },
  userBubble: { borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 },
  userBubbleText: { fontFamily: FONTS.regular, fontSize: 14, color: '#fff', lineHeight: 20 },

  aiBubbleRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.md, paddingHorizontal: SPACING.lg },
  aiBubbleContent: { maxWidth: '78%', marginLeft: SPACING.sm },
  aiAvatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: COLORS.primary, 
    alignItems: 'center', 
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(232,112,94,0.3)' },
      default: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4
      }
    })
  },
  aiBubble: { backgroundColor: COLORS.surface, borderRadius: 20, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12 },
  aiBubbleText: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textDark, lineHeight: 21 },
  timeLabel: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textMuted, marginTop: 4, marginHorizontal: 4 },

  typingDot: { width: 8, height: 8, borderRadius: 4 },

  // AIActionCard
  actionCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  actionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  actionSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  actionButtons: { flexDirection: 'row', gap: SPACING.sm },
  previewBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: RADIUS.button, borderWidth: 1.5, borderColor: COLORS.border },
  previewBtnText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: RADIUS.button },
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff' },

  // SmartReplyChips
  chipsContainer: { paddingVertical: SPACING.sm },
  chipsScroll: { marginBottom: 4 },
  chipsContent: { paddingHorizontal: SPACING.lg, paddingRight: SPACING.xl, alignItems: 'center', gap: 10 },
  chip: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(232,112,94,0.3)', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    backgroundColor: COLORS.surface 
  },
  chipText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textDark },

  // InsightCard
  insightCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.md, borderLeftWidth: 4 },
  insightHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  insightIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  insightBadge: { borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3 },
  insightBadgeText: { fontFamily: FONTS.bold, fontSize: 11 },
  insightDesc: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 19 },
  insightAction: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm },
  insightActionText: { fontFamily: FONTS.bold, fontSize: 13 },
});
