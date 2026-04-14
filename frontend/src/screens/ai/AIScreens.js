/**
 * AI Screens — Stitch-accurate
 * AIHomeScreen: light background, header, feature cards grid, chat CTA
 * AIChatScreen: clean chat UI with coral user bubbles, white AI bubbles
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useAIStore } from '../../store/aiStore';
import { useMetricsStore } from '../../store/metricsStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { ChatBubble, SmartReplyChips, AIActionCard, TypingIndicator } from '../../components/ai/AIComponents';
import { sendMessageToClaude } from '../../services/ai/claudeService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

/* ─── Feature card data ──────────────────────────────────────────────────────── */
const AI_FEATURES = [
  {
    icon: 'calendar-outline',
    title: 'Workout Planner',
    subtitle: 'Build a custom weekly plan',
    color: COLORS.primary,
    bg: '#FFF0EE',
    screen: 'WorkoutPlanner',
  },
  {
    icon: 'nutrition-outline',
    title: 'Diet Planner',
    subtitle: 'Calculate your macros',
    color: COLORS.secondary,
    bg: '#EDF9F8',
    screen: 'DietPlanner',
  },
  {
    icon: 'bar-chart-outline',
    title: 'Progress Analyzer',
    subtitle: 'Insights from your data',
    color: '#6C8FC7',
    bg: '#EEF2FA',
    screen: 'ProgressAnalyzer',
  },
  {
    icon: 'refresh-outline',
    title: 'Routine Optimizer',
    subtitle: 'Science-based improvements',
    color: '#F5A623',
    bg: '#FFF8EE',
    screen: 'RoutineOptimizer',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   AI HOME SCREEN
   Stitch: light #F0F2F5 bg, greeting header, feature 2x2 grid, chat button
─────────────────────────────────────────────────────────────────────────────── */
export function AIHomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { todayMetrics } = useMetricsStore();
  const firstName = user?.name?.split(' ')[0] || 'Alex';
  const hour = new Date().getHours();
  const greetLabel = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  // Compute a quick insight from metrics
  const sleepOk  = todayMetrics.sleep >= 7;
  const stepsOk  = todayMetrics.steps >= 8000;
  const insightTxt = sleepOk && stepsOk
    ? "You're on track today! Sleep and steps both look great."
    : !sleepOk
    ? `Sleep was ${todayMetrics.sleep}h last night — aim for 7–8h for optimal recovery.`
    : `Only ${todayMetrics.steps.toLocaleString()} steps so far — push for 10,000!`;

  return (
    <SafeAreaView style={aS.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={aS.scroll}>

        {/* ── Header ── */}
        <View style={aS.header}>
          <View>
            <Text style={aS.greetSmall}>{greetLabel}</Text>
            <Text style={aS.greetLarge}>AI Coach</Text>
          </View>
          <View style={aS.aiChip}>
            <Ionicons name="hardware-chip-outline" size={14} color={COLORS.primary} />
            <Text style={aS.aiChipText}>Claude AI</Text>
          </View>
        </View>

        {/* ── Insight banner ── */}
        <View style={[aS.insightCard, SHADOWS.card]}>
          <View style={aS.insightLeft}>
            <View style={aS.insightIcon}>
              <Ionicons name="bulb-outline" size={20} color="#F5A623" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={aS.insightLabel}>TODAY'S INSIGHT</Text>
            <Text style={aS.insightText}>{insightTxt}</Text>
          </View>
        </View>

        {/* ── Feature grid 2x2 ── */}
        <Text style={aS.sectionTitle}>What can I help with?</Text>
        <View style={aS.grid}>
          {AI_FEATURES.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[aS.featureCard, { backgroundColor: f.bg }, SHADOWS.card]}
              onPress={() => navigation.navigate(f.screen)}
              activeOpacity={0.85}
            >
              <View style={[aS.featureIcon, { backgroundColor: f.color + '20' }]}>
                <Ionicons name={f.icon} size={24} color={f.color} />
              </View>
              <Text style={aS.featureTitle}>{f.title}</Text>
              <Text style={aS.featureSub}>{f.subtitle}</Text>
              <View style={[aS.featureArrow, { backgroundColor: f.color + '15' }]}>
                <Ionicons name="arrow-forward" size={12} color={f.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent activity ── */}
        <Text style={aS.sectionTitle}>Quick Actions</Text>
        <View style={aS.quickRow}>
          {[
            { icon: 'chatbubble-ellipses-outline', label: 'Ask a question', action: () => navigation.navigate('AIChat') },
            { icon: 'trending-up-outline', label: 'View progress', action: () => navigation.navigate('ProgressAnalyzer') },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[aS.quickCard, SHADOWS.card]}
              onPress={item.action}
              activeOpacity={0.85}
            >
              <Ionicons name={item.icon} size={22} color={COLORS.primary} />
              <Text style={aS.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Chat CTA ── */}
        <TouchableOpacity
          style={aS.chatCta}
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[COLORS.primary, '#D96055']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={aS.chatCtaGrad}
          >
            <View style={aS.chatCtaLeft}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
              <View style={{ marginLeft: SPACING.md }}>
                <Text style={aS.chatCtaTitle}>Chat with AI Coach</Text>
                <Text style={aS.chatCtaSub}>Ask anything about fitness</Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const aS = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: SPACING.sm, marginBottom: SPACING.lg,
  },
  greetSmall: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.2 },
  greetLarge: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.textDark, letterSpacing: -0.5 },
  aiChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 6,
  },
  aiChipText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.primary, marginLeft: 5 },
  insightCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACING.lg, marginBottom: SPACING.xl,
    borderLeftWidth: 4, borderLeftColor: '#F5A623',
  },
  insightLeft: { marginRight: SPACING.md, marginTop: 2 },
  insightIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFF8EE', alignItems: 'center', justifyContent: 'center',
  },
  insightLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#F5A623', letterSpacing: 1, marginBottom: 4 },
  insightText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark, marginBottom: SPACING.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.xl },
  featureCard: {
    width: '48%', borderRadius: RADIUS.card, padding: SPACING.lg,
    marginRight: '4%', marginBottom: SPACING.md, position: 'relative',
  },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  featureTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, marginBottom: 3 },
  featureSub: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },
  featureArrow: {
    position: 'absolute', top: SPACING.md, right: SPACING.md,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  quickRow: { flexDirection: 'row', marginBottom: SPACING.xl },
  quickCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACING.lg, alignItems: 'center', marginRight: SPACING.md,
  },
  quickLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textDark, marginTop: 8, textAlign: 'center' },
  chatCta: { borderRadius: RADIUS.card, overflow: 'hidden', marginBottom: SPACING.md },
  chatCtaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  chatCtaLeft: { flexDirection: 'row', alignItems: 'center' },
  chatCtaTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff' },
  chatCtaSub: { fontFamily: FONTS.regular, fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
});

/* ─────────────────────────────────────────────────────────────────────────────
   AI CHAT SCREEN
   Stitch: white surface, chat bubbles, typing indicator, smart reply chips
─────────────────────────────────────────────────────────────────────────────── */
export function AIChatScreen({ navigation }) {
  const { user }     = useAuthStore();
  const { chatHistory, isGenerating, addMessage, setGenerating, setLastPlan, getAPIMessages } = useAIStore();
  const { todayMetrics } = useMetricsStore();
  const { applyAIPlan }  = useWorkoutStore();
  const [input, setInput]       = useState('');
  const [lastPlanMsg, setLastPlanMsg] = useState(null);
  const [toast, setToast]       = useState('');
  const flatRef = useRef(null);

  const userCtx = {
    name:    user?.name || 'Alex',
    goal:    user?.goal || 'Build Muscle',
    level:   user?.level || 'Intermediate',
    streak:  user?.streak || 0,
    metrics: todayMetrics,
  };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isGenerating) return;
    setInput('');
    addMessage({ role: 'user', text: msg });
    setGenerating(true);

    try {
      const msgs = [...getAPIMessages(), { role: 'user', content: msg }];
      const { text: reply, parsedPlan } = await sendMessageToClaude(msgs, userCtx);
      addMessage({ role: 'assistant', text: reply });
      if (parsedPlan) { setLastPlanMsg(parsedPlan); setLastPlan(parsedPlan); }
    } catch {
      addMessage({ role: 'assistant', text: "Connection error — please check your API key and try again." });
    } finally {
      setGenerating(false);
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 200);
    }
  };

  const savePlan = () => {
    if (lastPlanMsg?.workoutPlan) {
      applyAIPlan(lastPlanMsg);
      setToast('Plan saved to My Routines!');
      setLastPlanMsg(null);
      setTimeout(() => setToast(''), 2800);
    }
  };

  return (
    <SafeAreaView style={chS.container} edges={['top']}>
      {/* Header */}
      <View style={chS.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={chS.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={chS.headerCenter}>
          <View style={chS.aiAvatar}>
            <Ionicons name="hardware-chip-outline" size={18} color="#fff" />
          </View>
          <View>
            <Text style={chS.headerTitle}>AI Coach</Text>
            <View style={chS.onlineRow}>
              <View style={chS.onlineDot} />
              <Text style={chS.onlineText}>Online · Claude Sonnet</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Toast */}
        {toast ? (
          <View style={chS.toast}>
            <Ionicons name="checkmark-done-circle" size={16} color={COLORS.secondary} />
            <Text style={chS.toastText}>{toast}</Text>
          </View>
        ) : null}

        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={chatHistory}
          keyExtractor={item => item.id}
          contentContainerStyle={chS.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <ChatBubble message={item} userName={user?.name} />}
          ListFooterComponent={() => (
            <>
              {isGenerating && <TypingIndicator />}
              {lastPlanMsg && (
                <AIActionCard plan={lastPlanMsg} onPreview={() => {}} onSave={savePlan} />
              )}
            </>
          )}
        />

        {/* Smart replies */}
        <SmartReplyChips onSelect={send} />

        {/* Input bar */}
        <View style={chS.inputBar}>
          <View style={chS.inputWrap}>
            <TextInput
              style={chS.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message AI Coach..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={500}
              onSubmitEditing={() => send()}
            />
          </View>
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || isGenerating}
            style={[chS.sendBtn, (!input.trim() || isGenerating) && { opacity: 0.4 }]}
          >
            <LinearGradient colors={[COLORS.primary, '#D96055']} style={chS.sendGrad}>
              <Ionicons name="send" size={17} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const chS = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4, marginRight: SPACING.sm },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  aiAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759', marginRight: 5 },
  onlineText: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted },
  toast: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.dark, marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg, paddingVertical: 10,
  },
  toastText: { fontFamily: FONTS.medium, fontSize: 13, color: '#fff', marginLeft: 8 },
  messageList: { paddingVertical: SPACING.md },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  inputWrap: {
    flex: 1, backgroundColor: COLORS.background,
    borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 16, marginRight: SPACING.sm,
    minHeight: 44, justifyContent: 'center',
  },
  input: {
    fontFamily: FONTS.regular, fontSize: 15,
    color: COLORS.textDark, maxHeight: 100,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
  },
  sendBtn: { marginBottom: 2 },
  sendGrad: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
