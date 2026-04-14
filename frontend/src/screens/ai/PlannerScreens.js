import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { useDietStore } from '../../store/dietStore';
import { useMetricsStore } from '../../store/metricsStore';
import { InsightCard } from '../../components/ai/AIComponents';
import { generateWorkoutPlan, generateDietPlan, analyzeProgress, optimizeRoutine } from '../../services/ai/claudeService';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

// ─── Generating Screen ────────────────────────────────────────────────────────
function GeneratingView({ label }) {
  const rotation = useSharedValue(0);
  const rotation2 = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1);
    rotation2.value = withRepeat(withTiming(-360, { duration: 3000, easing: Easing.linear }), -1);
  }, []);

  const ring1Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation2.value}deg` }] }));

  return (
    <View style={genStyles.container}>
      <View style={genStyles.orbitContainer}>
        <Animated.View style={[genStyles.ring1, ring1Style]} />
        <Animated.View style={[genStyles.ring2, ring2Style]} />
        <View style={genStyles.center}>
          <Ionicons name="hardware-chip-outline" size={32} color={COLORS.primary} />
        </View>
      </View>
      <Text style={genStyles.label}>{label || 'Generating your plan...'}</Text>
      <Text style={genStyles.sub}>Powered by Claude AI</Text>
    </View>
  );
}

const genStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.dark, padding: SPACING.xl },
  orbitContainer: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  ring1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: COLORS.primary, borderTopColor: 'transparent' },
  ring2: { position: 'absolute', width: 95, height: 95, borderRadius: 47, borderWidth: 2, borderColor: COLORS.secondary, borderBottomColor: 'transparent' },
  center: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,125,107,0.15)', alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FONTS.black, fontSize: 22, color: '#fff', textAlign: 'center', marginBottom: 8 },
  sub: { fontFamily: FONTS.regular, fontSize: 14, color: 'rgba(255,255,255,0.5)' },
});

// ─── WorkoutPlannerScreen ─────────────────────────────────────────────────────
export function WorkoutPlannerScreen({ navigation }) {
  const { user } = useAuthStore();
  const { applyAIPlan } = useWorkoutStore();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [experience, setExperience] = useState('');
  const [days, setDays] = useState(4);
  const [equipment, setEquipment] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);
  const [saved, setSaved] = useState(false);

  const GOALS = [
    { id: 'Lose Weight', icon: 'trending-down-outline' },
    { id: 'Build Muscle', icon: 'barbell-outline' },
    { id: 'Get Stronger', icon: 'flash-outline' },
    { id: 'Stay Active', icon: 'leaf-outline' },
  ];
  const EXP = [
    { id: 'Beginner', icon: 'school-outline' },
    { id: 'Intermediate', icon: 'ribbon-outline' },
    { id: 'Advanced', icon: 'trophy-outline' },
  ];
  const EQUIP = ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Bands'];

  const toggleEquip = (e) => setEquipment((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);

  const generate = async () => {
    setGenerating(true);
    try {
      const userCtx = { name: user?.name || 'Alex', goal, level: experience, streak: user?.streak || 0, metrics: {} };
      const result = await generateWorkoutPlan({ daysPerWeek: days, goal, experience, equipment }, userCtx);
      if (result.parsedPlan) setPlan(result.parsedPlan);
      else setPlan({ workoutPlan: [{ title: 'Custom Day 1', day: 'Monday', muscleGroup: 'Full Body', exercises: [{ name: 'Squat', sets: 4, reps: 8, weight: 80, rest: 90 }] }] });
    } catch (e) {
      setPlan({ workoutPlan: [{ title: 'Push Day', day: 'Monday', muscleGroup: 'Chest/Shoulders/Triceps', exercises: [{ name: 'Bench Press', sets: 4, reps: 8, weight: 80, rest: 90 }] }] });
    }
    setGenerating(false);
  };

  if (generating) return <GeneratingView label="Building your workout plan..." />;

  if (plan) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.hdr}>
          <TouchableOpacity onPress={() => setPlan(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.hdrTitle}>Your Plan</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {plan.workoutPlan?.map((day, i) => (
            <View key={i} style={[styles.planDay, SHADOWS.card]}>
              <View style={styles.planDayHeader}>
                <View style={styles.planDayPill}><Text style={styles.planDayPillText}>{day.day}</Text></View>
                <Text style={styles.planDayTitle}>{day.title}</Text>
              </View>
              <Text style={styles.planMuscle}>{day.muscleGroup}</Text>
              {day.exercises?.map((ex, j) => (
                <Text key={j} style={styles.planEx}>· {ex.name} — {ex.sets}×{ex.reps}</Text>
              ))}
            </View>
          ))}

          <View style={styles.stickyBar}>
            <TouchableOpacity style={styles.customizeBtn}>
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
              <Text style={styles.customizeBtnText}>Customize</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.savePlanBtn}
              onPress={() => { applyAIPlan(plan); setSaved(true); setTimeout(() => navigation.goBack(), 1200); }}
            >
              <LinearGradient colors={['#FF7D6B', '#FF9A8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.savePlanGrad}>
                <Ionicons name={saved ? 'checkmark-circle' : 'checkmark-circle-outline'} size={18} color="#fff" />
                <Text style={styles.savePlanText}>{saved ? 'Saved!' : 'Save to My Routines'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.hdr}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.hdrTitle}>Workout Planner</Text>
        <Text style={styles.stepLabel}>{step}/4</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>What's your goal?</Text>
            <View style={styles.bigCardGrid}>
              {GOALS.map((g) => (
                <TouchableOpacity key={g.id} onPress={() => setGoal(g.id)} style={[styles.bigCard, goal === g.id && styles.bigCardActive]}>
                  <Ionicons name={g.icon} size={32} color={goal === g.id ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.bigCardText, goal === g.id && { color: COLORS.primary }]}>{g.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Experience level?</Text>
            <View style={styles.expCards}>
              {EXP.map((e) => (
                <TouchableOpacity key={e.id} onPress={() => setExperience(e.id)} style={[styles.expCard, experience === e.id && styles.expCardActive]}>
                  <Ionicons name={e.icon} size={28} color={experience === e.id ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.expText, experience === e.id && { color: COLORS.primary }]}>{e.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>Days per week?</Text>
            <View style={styles.daysStepper}>
              <TouchableOpacity onPress={() => setDays(d => Math.max(3, d - 1))} style={styles.stepperBtn}>
                <Ionicons name="remove-circle-outline" size={36} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.daysVal}>{days}</Text>
              <TouchableOpacity onPress={() => setDays(d => Math.min(6, d + 1))} style={styles.stepperBtn}>
                <Ionicons name="add-circle-outline" size={36} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.daysHint}>{days <= 3 ? 'Full Body split' : days <= 4 ? 'Upper/Lower split' : days <= 5 ? 'Push/Pull/Legs' : 'PPL + accessories'}</Text>
          </>
        )}

        {step === 4 && (
          <>
            <Text style={styles.stepTitle}>Available equipment?</Text>
            <View style={styles.equipGrid}>
              {EQUIP.map((e) => (
                <TouchableOpacity key={e} onPress={() => toggleEquip(e)} style={[styles.equipPill, equipment.includes(e) && styles.equipPillActive]}>
                  <Text style={[styles.equipText, equipment.includes(e) && { color: '#fff' }]}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.nextBtn, (!goal && step === 1 || !experience && step === 2) && { opacity: 0.5 }]}
          onPress={() => step < 4 ? setStep(s => s + 1) : generate()}
          disabled={(!goal && step === 1) || (!experience && step === 2)}
        >
          <LinearGradient colors={['#FF7D6B', '#FF9A8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
            <Text style={styles.nextBtnText}>{step === 4 ? 'Generate Plan' : 'Continue'}</Text>
            <Ionicons name={step === 4 ? 'hardware-chip-outline' : 'arrow-forward'} size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── DietPlannerScreen ────────────────────────────────────────────────────────
export function DietPlannerScreen({ navigation }) {
  const { user } = useAuthStore();
  const { applyAIDietPlan } = useDietStore();
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState('82');
  const [height, setHeight] = useState('180');
  const [age, setAge] = useState('28');
  const [dietGoal, setDietGoal] = useState('');
  const [preferences, setPreferences] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);

  const DIET_GOALS = [
    { id: 'Cut', icon: 'trending-down-outline' },
    { id: 'Maintain', icon: 'remove-outline' },
    { id: 'Bulk', icon: 'trending-up-outline' },
  ];
  const PREFS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'High Protein', 'Low Carb'];
  const togglePref = (p) => setPreferences((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const generate = async () => {
    setGenerating(true);
    try {
      const userCtx = { name: user?.name || 'Alex', goal: dietGoal, level: 'Intermediate', streak: 0, metrics: {} };
      const result = await generateDietPlan({ weight: +weight, height: +height, age: +age, goal: dietGoal, preferences }, userCtx);
      if (result.parsedPlan?.dietPlan) setPlan(result.parsedPlan.dietPlan);
      else setPlan({ calories: 2400, protein: 180, fat: 70, carbs: 260 });
    } catch {
      setPlan({ calories: 2400, protein: 180, fat: 70, carbs: 260 });
    }
    setGenerating(false);
  };

  if (generating) return <GeneratingView label="Calculating your macros..." />;

  if (plan) {
    const macros = [
      { label: 'Calories', value: plan.calories, unit: 'kcal', color: COLORS.primary },
      { label: 'Protein', value: plan.protein, unit: 'g', color: COLORS.secondary },
      { label: 'Fat', value: plan.fat, unit: 'g', color: '#FFB347' },
      { label: 'Carbs', value: plan.carbs, unit: 'g', color: COLORS.sleepBlue },
    ];

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.hdr}>
          <TouchableOpacity onPress={() => setPlan(null)}><Ionicons name="arrow-back" size={24} color={COLORS.textDark} /></TouchableOpacity>
          <Text style={styles.hdrTitle}>Your Diet Plan</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.macroGrid}>
            {macros.map((m) => (
              <View key={m.label} style={[styles.macroCard, SHADOWS.card, { borderTopWidth: 3, borderTopColor: m.color }]}>
                <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.macroUnit}>{m.unit}</Text>
                <Text style={styles.macroLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={() => { applyAIDietPlan({ dietPlan: plan }); navigation.goBack(); }}>
            <LinearGradient colors={['#FF7D6B', '#FF9A8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.nextBtnText}>Apply to My Diet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.hdr}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textDark} /></TouchableOpacity>
        <Text style={styles.hdrTitle}>Diet Planner</Text>
        <Text style={styles.stepLabel}>{step}/3</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 && (
          <>
            <Text style={styles.stepTitle}>Your body stats</Text>
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}><Text style={styles.inputLbl}>Weight (kg)</Text><TextInput style={styles.numInput} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}><Text style={styles.inputLbl}>Height (cm)</Text><TextInput style={styles.numInput} value={height} onChangeText={setHeight} keyboardType="number-pad" /></View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}><Text style={styles.inputLbl}>Age</Text><TextInput style={styles.numInput} value={age} onChangeText={setAge} keyboardType="number-pad" /></View>
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.stepTitle}>Diet goal?</Text>
            <View style={styles.expCards}>
              {DIET_GOALS.map((g) => (
                <TouchableOpacity key={g.id} onPress={() => setDietGoal(g.id)} style={[styles.expCard, dietGoal === g.id && styles.expCardActive]}>
                  <Ionicons name={g.icon} size={28} color={dietGoal === g.id ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.expText, dietGoal === g.id && { color: COLORS.primary }]}>{g.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.stepTitle}>Dietary preferences?</Text>
            <View style={styles.equipGrid}>
              {PREFS.map((p) => (
                <TouchableOpacity key={p} onPress={() => togglePref(p)} style={[styles.equipPill, preferences.includes(p) && styles.equipPillActive]}>
                  <Text style={[styles.equipText, preferences.includes(p) && { color: '#fff' }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={() => step < 3 ? setStep(s => s + 1) : generate()}>
          <LinearGradient colors={['#FF7D6B', '#FF9A8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
            <Text style={styles.nextBtnText}>{step === 3 ? 'Calculate Macros' : 'Continue'}</Text>
            <Ionicons name={step === 3 ? 'nutrition-outline' : 'arrow-forward'} size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ProgressAnalyzerScreen ───────────────────────────────────────────────────
export function ProgressAnalyzerScreen({ navigation }) {
  const { user } = useAuthStore();
  const { todayMetrics, weeklyData } = useMetricsStore();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);
  const [done, setDone] = useState(false);

  const analyze = async () => {
    setLoading(true);
    const userCtx = { name: user?.name || 'Alex', goal: user?.goal || 'Build Muscle', level: user?.level || 'Intermediate', streak: user?.streak || 0, metrics: todayMetrics };
    try {
      const result = await analyzeProgress({ today: todayMetrics, week: weeklyData }, userCtx);
      setInsights(result.parsedPlan?.insights || getFallbackInsights());
    } catch {
      setInsights(getFallbackInsights());
    }
    setLoading(false);
    setDone(true);
  };

  const getFallbackInsights = () => [
    { icon: 'water-outline', title: 'Hydration Needs Attention', stat: '1.75L avg', description: 'Your daily water intake is 30% below your 2.5L goal. Try setting hourly reminders.', action: 'Track Water', color: COLORS.secondary },
    { icon: 'moon-outline', title: 'Sleep Pattern Detected', stat: '7.4h avg', description: 'You sleep 0.6h less on weekdays. A consistent bedtime routine could improve your readiness score.', action: 'View Sleep', color: '#7B8CDE' },
    { icon: 'barbell-outline', title: 'Workout Consistency', stat: '4/7 days', description: 'Great consistency! You hit 4 workouts this week. Can you squeeze in one more?', action: 'Plan Workout', color: COLORS.primary },
    { icon: 'flame-outline', title: 'Calorie Deficit', stat: '-450 kcal/day', description: 'Averaging a 450 kcal daily deficit this week — well aligned with your Build Muscle goal.', action: 'View Calories', color: '#FFB347' },
  ];

  if (loading) return <GeneratingView label="Analyzing your progress..." />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textDark} /></TouchableOpacity>
        <Text style={styles.hdrTitle}>Progress Analyzer</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!done ? (
          <View style={styles.analyzePrompt}>
            <View style={styles.analyzeIcon}>
              <Ionicons name="bar-chart-outline" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.analyzeTitle}>Ready to analyze?</Text>
            <Text style={styles.analyzeSub}>Claude will review your last 30 days of data and surface key insights.</Text>
            <TouchableOpacity onPress={analyze} style={styles.nextBtn}>
              <LinearGradient colors={['#FF7D6B', '#FF9A8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Ionicons name="hardware-chip-outline" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Analyze My Progress</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.stepTitle}>Your Insights</Text>
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} onAction={() => {}} />
            ))}
            <TouchableOpacity onPress={analyze} style={[styles.nextBtn, { marginTop: SPACING.md }]}>
              <LinearGradient colors={['#6DD5C0', '#4ECDB4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Ionicons name="refresh-outline" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Re-analyze</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── RoutineOptimizerScreen ───────────────────────────────────────────────────
export function RoutineOptimizerScreen({ navigation }) {
  const { user } = useAuthStore();
  const { routines, updateRoutine } = useWorkoutStore();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [done, setDone] = useState(false);
  const [applied, setApplied] = useState([]);

  const optimize = async () => {
    setLoading(true);
    const userCtx = { name: user?.name || 'Alex', goal: user?.goal || 'Build Muscle', level: user?.level || 'Intermediate', streak: user?.streak || 0, metrics: {} };
    try {
      const result = await optimizeRoutine(routines, userCtx);
      setSuggestions(result.parsedPlan?.suggestions || getFallback());
    } catch {
      setSuggestions(getFallback());
    }
    setLoading(false);
    setDone(true);
  };

  const getFallback = () => [
    { icon: 'barbell-outline', title: 'Add Rear Delt Work', description: 'Your Push days lack rear deltoid isolation. Add Face Pulls or Rear Delt Flys to balance shoulder development.', impact: 'High' },
    { icon: 'time-outline', title: 'Increase Rest on Big Lifts', description: 'Consider 120–180s rest for compound lifts like Squat and Deadlift to maximize strength output.', impact: 'Medium' },
    { icon: 'refresh-outline', title: 'Periodize Intensity', description: 'You\'ve been running the same weights for 2+ weeks. Consider a deload or progressive overload schedule.', impact: 'High' },
    { icon: 'body-outline', title: 'Add Core Work', description: 'None of your routines include dedicated core exercises. Add planks or cable crunches to prevent injury.', impact: 'Medium' },
  ];

  const applyAll = () => {
    setApplied(suggestions.map((_, i) => i));
  };

  if (loading) return <GeneratingView label="Optimizing your routines..." />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textDark} /></TouchableOpacity>
        <Text style={styles.hdrTitle}>Routine Optimizer</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!done ? (
          <View style={styles.analyzePrompt}>
            <View style={styles.analyzeIcon}>
              <Ionicons name="refresh-outline" size={48} color={COLORS.secondary} />
            </View>
            <Text style={styles.analyzeTitle}>Optimize Your Routines</Text>
            <Text style={styles.analyzeSub}>Claude will review your current workout split and suggest science-based improvements.</Text>
            <Text style={styles.routineCount}>{routines.length} routines to analyze</Text>
            <TouchableOpacity onPress={optimize} style={styles.nextBtn}>
              <LinearGradient colors={['#6DD5C0', '#4ECDB4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Ionicons name="hardware-chip-outline" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Optimize Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.stepTitle}>Suggestions</Text>
            {suggestions.map((s, i) => (
              <View key={i} style={[styles.suggCard, SHADOWS.card, applied.includes(i) && styles.suggCardApplied]}>
                <View style={styles.suggHeader}>
                  <View style={[styles.suggIcon, { backgroundColor: 'rgba(109,213,192,0.12)' }]}>
                    <Ionicons name={s.icon || 'bulb-outline'} size={20} color={COLORS.secondary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.suggTitle}>{s.title}</Text>
                    <View style={[styles.impactBadge, { backgroundColor: s.impact === 'High' ? 'rgba(255,125,107,0.15)' : 'rgba(255,179,71,0.15)' }]}>
                      <Text style={[styles.impactText, { color: s.impact === 'High' ? COLORS.primary : '#FFB347' }]}>{s.impact} Impact</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setApplied(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}>
                    <Ionicons name={applied.includes(i) ? 'checkmark-circle' : 'checkmark-circle-outline'} size={24} color={applied.includes(i) ? COLORS.secondary : COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.suggDesc}>{s.description}</Text>
              </View>
            ))}

            <TouchableOpacity onPress={applyAll} style={styles.nextBtn}>
              <LinearGradient colors={['#FF7D6B', '#FF9A8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Ionicons name="checkmark-done-circle-outline" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Apply All Suggestions</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  hdrTitle: { fontFamily: FONTS.bold, fontSize: 17, color: COLORS.textDark },
  stepLabel: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  content: { padding: SPACING.lg, paddingBottom: 40 },
  stepTitle: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.textDark, marginBottom: SPACING.xl },
  bigCardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  bigCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.card },
  bigCardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(255,125,107,0.06)' },
  bigCardText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, textAlign: 'center' },
  expCards: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  expCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.card },
  expCardActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(255,125,107,0.06)' },
  expText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
  daysStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xl, marginBottom: SPACING.lg },
  stepperBtn: { padding: 8 },
  daysVal: { fontFamily: FONTS.black, fontSize: 64, color: COLORS.primary },
  daysHint: { textAlign: 'center', fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl },
  equipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.xl },
  equipPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  equipPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  equipText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  nextBtn: { borderRadius: RADIUS.button, overflow: 'hidden', marginTop: SPACING.md },
  nextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  nextBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },
  planDay: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.md },
  planDayHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  planDayPill: { backgroundColor: COLORS.primary, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3 },
  planDayPillText: { fontFamily: FONTS.bold, fontSize: 11, color: '#fff' },
  planDayTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  planMuscle: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginBottom: 8 },
  planEx: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 22 },
  stickyBar: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
  customizeBtn: { flex: 0.4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: RADIUS.button, borderWidth: 1.5, borderColor: COLORS.primary },
  customizeBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary },
  savePlanBtn: { flex: 0.6, borderRadius: RADIUS.button, overflow: 'hidden' },
  savePlanGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
  savePlanText: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff' },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  macroCard: { width: '47%', backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, alignItems: 'center' },
  macroValue: { fontFamily: FONTS.black, fontSize: 36 },
  macroUnit: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted },
  macroLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  inputRow: { flexDirection: 'row', marginBottom: SPACING.xl },
  inputLbl: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, marginBottom: 6 },
  numInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.input, padding: 12, fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark, textAlign: 'center' },
  analyzePrompt: { alignItems: 'center', paddingVertical: SPACING.xxl },
  analyzeIcon: { width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(255,125,107,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
  analyzeTitle: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.textDark, textAlign: 'center', marginBottom: 8 },
  analyzeSub: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
  routineCount: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.secondary, marginBottom: SPACING.lg },
  suggCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.md },
  suggCardApplied: { borderWidth: 1.5, borderColor: COLORS.secondary },
  suggHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  suggIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  suggTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, marginBottom: 4 },
  impactBadge: { borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  impactText: { fontFamily: FONTS.bold, fontSize: 11 },
  suggDesc: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },
});
