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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useAIStore } from '../../store/aiStore';
import { useMetricsStore } from '../../store/metricsStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { ChatBubble, SmartReplyChips, AIActionCard, TypingIndicator } from '../../components/ai_coach/AIComponents';
import { sendMessageToGemini } from '../../services/ai_service/geminiService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

/* ─── Feature card data ──────────────────────────────────────────────────────── */
const AI_FEATURES = [
  {
    icon: 'dumbbell',
    library: 'MaterialCommunityIcons',
    title: 'Build\nPlan',
    color: '#FF6B6B',
    bg: '#FFF',
    screen: 'WorkoutPlanner',
  },
  {
    icon: 'silverware-fork-knife',
    library: 'MaterialCommunityIcons',
    title: 'Plan My\nDiet',
    color: '#4ECDC4',
    bg: '#FFF',
    screen: 'DietPlanner',
  },
  {
    icon: 'chart-line-variant',
    library: 'MaterialCommunityIcons',
    title: 'My\nProgress',
    color: '#45B7D1',
    bg: '#FFF',
    screen: 'ProgressAnalyzer',
  },
  {
    icon: 'speedometer',
    library: 'MaterialCommunityIcons',
    title: 'Optimise\nmy progress',
    color: '#FF8ED4',
    bg: '#FFF',
    screen: 'RoutineOptimizer',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   AI HOME SCREEN
   Updated Redesign: Matching User Reference Image
   Dark Banner, Metrics Row, Featured Card, 2x2 Grid
 ─────────────────────────────────────────────────────────────────────────────── */
export function AIHomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { todayMetrics } = useMetricsStore();
  const firstName = user?.name?.split(' ')[0] || 'Alex';

  // Compute a quick insight from metrics (simulated logic for the quote)
  const insightTxt = "You've trained 3 days straight — consider a rest day tomorrow for muscle recovery.";

  return (
    <SafeAreaView style={aS.container} edges={['top']}>
      {/* ── Header Banner ── */}
      <View style={aS.headerBanner}>
        <Text style={aS.welcomeBack}>WELCOME BACK</Text>
        <Text style={aS.bannerTitle}>Hey {firstName} 👋</Text>
        <Text style={aS.bannerSub}>Your AI coach is ready</Text>

        {/* ── Metrics Row ── */}
        <View style={aS.metricsRow}>
          <View style={aS.metricCard}>
            <Text style={aS.metricLabel}>STREAK</Text>
            <Text style={aS.metricValue}>{user?.streak || 5} days</Text>
          </View>
          <View style={aS.metricCard}>
            <Text style={aS.metricLabel}>WORKOUTS</Text>
            <Text style={aS.metricValue}>3</Text>
          </View>
          <View style={aS.metricCard}>
            <Text style={aS.metricLabel}>RECOVERY</Text>
            <Text style={[aS.metricValue, { color: '#4ECDC4' }]}>Good</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={aS.scroll}>
        
        {/* ── Featured Card: Form Tracker ── */}
        <TouchableOpacity 
          style={aS.featuredCard} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('FormTracker')}
        >
          <View style={aS.featuredLeft}>
            <View style={aS.featuredIconWrap}>
              <MaterialCommunityIcons name="video" size={24} color="#B03E32" />
            </View>
            <View style={aS.featuredInfo}>
              <View style={aS.newBadgeRow}>
                <View style={aS.newBadge}>
                  <Text style={aS.newBadgeText}>NEW</Text>
                </View>
              </View>
              <Text style={aS.featuredTitle}>Form Tracker</Text>
              <Text style={aS.featuredSub}>AI watches your reps via camera</Text>
            </View>
          </View>
          <View style={aS.featuredArrow}>
            <Ionicons name="chevron-forward" size={20} color="#9BA3AF" />
          </View>
        </TouchableOpacity>

        {/* ── Feature grid 2x2 ── */}
        <View style={aS.grid}>
          {AI_FEATURES.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[aS.featureCard, SHADOWS.card]}
              onPress={() => navigation.navigate(f.screen)}
              activeOpacity={0.85}
            >
              <View style={[aS.featureIconWrap, { backgroundColor: f.color + '10' }]}>
                {f.library === 'MaterialCommunityIcons' ? (
                   <MaterialCommunityIcons name={f.icon} size={24} color={f.color} />
                ) : (
                   <Ionicons name={f.icon} size={24} color={f.color} />
                )}
              </View>
              <Text style={aS.featureTitle}>{f.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Insight card ── */}
        <View style={aS.insightCard}>
          <View style={aS.insightAccent} />
          <View style={aS.insightContent}>
            <View style={aS.insightHeader}>
              <View style={aS.insightDot} />
              <Text style={aS.insightTagText}>TODAY'S AI INSIGHT</Text>
            </View>
            <Text style={aS.insightBody}>
              "{insightTxt}"
            </Text>
          </View>
        </View>

        {/* ── Chat CTA ── */}
        <TouchableOpacity
          style={aS.chatBtn}
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.9}
        >
          <MaterialCommunityIcons name="chat-processing" size={24} color="#fff" />
          <Text style={aS.chatBtnText}>Chat with AI Coach</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const aS = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  
  headerBanner: {
    backgroundColor: '#1A2138',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  welcomeBack: { 
    fontFamily: FONTS.bold, 
    fontSize: 12, 
    color: '#9BA3AF', 
    letterSpacing: 1,
    marginBottom: 4 
  },
  bannerTitle: { 
    fontFamily: FONTS.black, 
    fontSize: 32, 
    color: '#fff', 
    marginBottom: 4 
  },
  bannerSub: { 
    fontFamily: FONTS.bold, 
    fontSize: 18, 
    color: '#E8705E' 
  },

  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  metricCard: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
  },
  metricLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#9BA3AF',
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: FONTS.black,
    fontSize: 16,
    color: '#fff',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  featuredCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    ...SHADOWS.card,
  },
  featuredLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  featuredIconWrap: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: '#FDECEA',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  featuredInfo: { flex: 1 },
  newBadgeRow: { marginBottom: 4 },
  newBadge: {
    backgroundColor: '#B03E32',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  newBadgeText: { fontFamily: FONTS.bold, fontSize: 10, color: '#fff' },
  featuredTitle: { fontFamily: FONTS.black, fontSize: 18, color: '#1A2138' },
  featuredSub: { fontFamily: FONTS.medium, fontSize: 12, color: '#9BA3AF', marginTop: 2 },
  featuredArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 24,
    padding: 20, marginBottom: 16, alignItems: 'flex-start',
    height: 140, justifyContent: 'space-between',
  },
  featureIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontFamily: FONTS.black, fontSize: 16, color: '#1A2138', lineHeight: 20 },

  insightCard: { 
    backgroundColor: '#F8F9FA', 
    borderRadius: 20, 
    flexDirection: 'row',
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F2F4',
  },
  insightAccent: { width: 4, backgroundColor: '#B03E32' },
  insightContent: { padding: 20, flex: 1 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  insightDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#B03E32', marginRight: 8 },
  insightTagText: { fontFamily: FONTS.bold, fontSize: 11, color: '#B03E32', letterSpacing: 0.5 },
  insightBody: { 
    fontFamily: FONTS.medium, 
    fontSize: 14, 
    color: '#4A5568', 
    lineHeight: 20,
    fontStyle: 'italic',
  },

  chatBtn: { 
    marginTop: 20, 
    backgroundColor: '#B03E32',
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    ...SHADOWS.primary,
  },
  chatBtnText: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff', marginLeft: 12 },
});

/* ─────────────────────────────────────────────────────────────────────────────
   AI CHAT SCREEN
   Stitch: white surface, chat bubbles, typing indicator, smart reply chips
─────────────────────────────────────────────────────────────────────────────── */
export function AIChatScreen({ navigation }) {
  const { user }     = useAuthStore();
  const { chatHistory, isGenerating, addMessage, setGenerating, setLastPlan, getAPIMessages, clearChat } = useAIStore();
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
      const { text: reply, parsedPlan } = await sendMessageToGemini(msgs, userCtx);
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

  const handleClearChat = () => {
    clearChat();
    setToast('Chat history cleared');
    setTimeout(() => setToast(''), 2800);
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
              <Text style={chS.onlineText}>Online · Gemini 3 Flash</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleClearChat} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
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
          <TouchableOpacity style={chS.attachBtn}>
            <Ionicons name="add" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={chS.inputWrap}>
            <TextInput
              style={chS.input}
              value={input}
              onChangeText={setInput}
              placeholder="Message AI Coach..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={500}
            />
          </View>
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || isGenerating}
            style={[chS.sendBtn, (!input.trim() || isGenerating) && { opacity: 0.4 }]}
          >
            <LinearGradient colors={[COLORS.primary, '#D96055']} style={chS.sendGrad}>
              <Ionicons name="arrow-up" size={20} color="#fff" />
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  headerTitle: { fontFamily: FONTS.black, fontSize: 16, color: COLORS.textDark, letterSpacing: 0.2 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759', marginRight: 6, borderWidth: 1.5, borderColor: '#fff' },
  onlineText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  toast: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.dark, marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg, paddingVertical: 10,
  },
  toastText: { fontFamily: FONTS.medium, fontSize: 13, color: '#fff', marginLeft: 8 },
  messageList: { paddingVertical: SPACING.md },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  attachBtn: { marginRight: SPACING.sm, padding: 4 },
  inputWrap: {
    flex: 1, backgroundColor: '#F0F2F5',
    borderRadius: 24, paddingHorizontal: 16,
    marginRight: SPACING.sm, minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontFamily: FONTS.regular, fontSize: 16,
    color: COLORS.textDark, maxHeight: 120,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  sendBtn: { marginLeft: 4 },
  sendGrad: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...SHADOWS.primary },
});
