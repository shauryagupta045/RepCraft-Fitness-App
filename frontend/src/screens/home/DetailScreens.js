/**
 * Detail Screens — Stitch-accurate pixel-perfect redesigns
 * Water | Sleep | Steps | Calories | WorkoutWeek
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';
import { useMetricsStore } from '../../store/metricsStore';
import { useWorkoutStore } from '../../store/workoutStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { DonutChart } from '../../components/home/HomeCards';

/* ─── Shared header ──────────────────────────────────────────────────────────── */
function Header({ title, subtitle, onBack, rightIcon }) {
  return (
    <View style={sh.header}>
      <TouchableOpacity onPress={onBack} style={sh.backBtn}>
        <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
      </TouchableOpacity>
      <View style={sh.center}>
        <Text style={sh.headerLogo}>RepCraft</Text>
      </View>
      <View style={{ width: 36 }}>
        {rightIcon || null}
      </View>
    </View>
  );
}
const sh = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  headerLogo: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
});

/* ─── Tab selector ───────────────────────────────────────────────────────────── */
function Tabs({ items, active, onSelect }) {
  return (
    <View style={ts.row}>
      {items.map((item, i) => (
        <TouchableOpacity
          key={item}
          onPress={() => onSelect(i)}
          style={[ts.tab, active === i && ts.tabActive]}
        >
          <Text style={[ts.label, active === i && ts.labelActive]}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const ts = StyleSheet.create({
  row: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: RADIUS.pill, padding: 3, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  tab: { flex: 1, paddingVertical: 7, borderRadius: RADIUS.pill, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.surface },
  label: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  labelActive: { fontFamily: FONTS.bold, color: COLORS.textDark },
});

/* ─── Simple bar chart (no external lib) ─────────────────────────────────────── */
function BarChart({ data, labels, color, height = 100, highlight = -1 }) {
  const { width } = useWindowDimensions();
  const chartW = width - SPACING.lg * 2;
  const max = Math.max(...data, 0.01);
  const barW = Math.floor((chartW - (data.length - 1) * 8) / data.length);

  return (
    <View>
      <Svg width={chartW} height={height + 20}>
        {data.map((val, i) => {
          const barH = Math.max((val / max) * height, 3);
          const x = i * (barW + 8);
          const y = height - barH;
          const isHighlight = i === highlight;
          return (
            <Rect
              key={i}
              x={x} y={y} width={barW} height={barH}
              rx={4}
              fill={isHighlight ? color : color + '40'}
            />
          );
        })}
      </Svg>
      <View style={{ flexDirection: 'row', paddingHorizontal: 0 }}>
        {labels.map((l, i) => (
          <Text
            key={i}
            style={{
              width: barW + 8, textAlign: 'center',
              fontFamily: FONTS.regular, fontSize: 10,
              color: i === highlight ? color : COLORS.textMuted,
            }}
          >{l}</Text>
        ))}
      </View>
    </View>
  );
}

/* ─── Stat card row ──────────────────────────────────────────────────────────── */
function StatCards({ items }) {
  return (
    <View style={stc.row}>
      {items.map((it, i) => (
        <View key={i} style={[stc.card, SHADOWS.sm]}>
          <Text style={[stc.val, it.color && { color: it.color }]}>{it.value}</Text>
          <Text style={stc.label}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}
const stc = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  card: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.md, alignItems: 'center', marginHorizontal: 4 },
  val: { fontFamily: FONTS.black, fontSize: 22, color: COLORS.textDark },
  label: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },
});

/* ════════════════════════════════════════════════════════════════════════════════
   WATER DETAIL SCREEN
   Stitch: large value, goal progress, weekly bars, intake log
════════════════════════════════════════════════════════════════════════════════ */
export function WaterDetailScreen({ navigation }) {
  const [tab, setTab] = useState(0);
  const { todayMetrics, weeklyData, logWater } = useMetricsStore();
  const goal = 2.5;
  const pct = Math.min(todayMetrics.water / goal, 1);
  const weekVals = weeklyData.map(d => d.water);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Hourly intake simulation
  const hourly = [0, 0, 0, 0, 0, 0, 0.25, 0.5, 0.25, 0, 0.25, 0.25, 0, 0.5, 0, 0.25, 0, 0, 0, 0, 0, 0, 0, 0];
  const hourLabels = ['6', '8', '10', '12', '14', '16', '18', '20'];

  return (
    <SafeAreaView style={ds.container} edges={['top']}>
      <Header title="Water" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>
        {/* Hero value */}
        <LinearGradient colors={['#4ECDC4', '#3DBDB5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ds.heroCard}>
          <Text style={ds.heroLabel}>WATER INTAKE</Text>
          <View style={ds.heroRow}>
            <Ionicons name="water" size={32} color="rgba(255,255,255,0.8)" />
            <Text style={ds.heroValue}>{todayMetrics.water.toFixed(2)}</Text>
            <Text style={ds.heroUnit}>L</Text>
          </View>
          <Text style={ds.heroSub}>{Math.round(pct * 100)}% of {goal}L daily goal</Text>
          {/* Progress bar */}
          <View style={ds.heroTrack}>
            <View style={[ds.heroFill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
          <TouchableOpacity onPress={logWater} style={ds.addWaterBtn}>
            <Ionicons name="add" size={18} color={COLORS.secondary} />
            <Text style={ds.addWaterText}>Add 250ml</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Tabs */}
        <Tabs items={['Day', 'Week', 'Month']} active={tab} onSelect={setTab} />

        {tab === 0 && (
          <>
            <Text style={ds.sectionTitle}>Today's Intake</Text>
            <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
              <BarChart data={hourly} labels={hourLabels} color={COLORS.secondary} height={80} highlight={9} />
            </View>
            <StatCards items={[
              { value: `${todayMetrics.water.toFixed(2)}L`, label: 'Consumed', color: COLORS.secondary },
              { value: `${(goal - todayMetrics.water).toFixed(2)}L`, label: 'Remaining' },
              { value: `${Math.round(todayMetrics.water * 1000)}ml`, label: 'Total ml' },
            ]} />
            {/* Glass log */}
            <Text style={[ds.sectionTitle, { paddingHorizontal: SPACING.lg }]}>Intake Log</Text>
            {[
              { time: '7:30 AM', amount: 500 },
              { time: '10:15 AM', amount: 250 },
              { time: '12:45 PM', amount: 500 },
              { time: '3:00 PM', amount: 250 },
              { time: '6:00 PM', amount: 250 },
            ].map((entry, i) => (
              <View key={i} style={[ds.logRow, { marginHorizontal: SPACING.lg }, SHADOWS.sm]}>
                <View style={[ds.logIcon, { backgroundColor: COLORS.secondary + '18' }]}>
                  <Ionicons name="water-outline" size={18} color={COLORS.secondary} />
                </View>
                <Text style={ds.logTime}>{entry.time}</Text>
                <Text style={[ds.logVal, { color: COLORS.secondary }]}>{entry.amount} ml</Text>
              </View>
            ))}
          </>
        )}

        {tab === 1 && (
          <>
            <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
              <BarChart data={weekVals} labels={dayLabels} color={COLORS.secondary} height={100} highlight={5} />
            </View>
            <StatCards items={[
              { value: `${(weekVals.reduce((a,b)=>a+b,0)/7).toFixed(1)}L`, label: 'Daily Avg', color: COLORS.secondary },
              { value: `${Math.max(...weekVals).toFixed(1)}L`, label: 'Best Day' },
              { value: `${weekVals.filter(v=>v>=goal).length}/7`, label: 'Goals Met' },
            ]} />
          </>
        )}

        {tab === 2 && (
          <>
            <StatCards items={[
              { value: `${(weekVals.reduce((a,b)=>a+b,0)/7).toFixed(1)}L`, label: 'Avg/Day', color: COLORS.secondary },
              { value: `${weekVals.filter(v=>v>=goal).length}`, label: 'Goals Met' },
              { value: `${(weekVals.reduce((a,b)=>a+b,0)).toFixed(0)}L`, label: 'Total' },
            ]} />
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   SLEEP DETAIL SCREEN
   Stitch: total duration, sleep quality score, architecture bar, trends
════════════════════════════════════════════════════════════════════════════════ */
export function SleepDetailScreen({ navigation }) {
  const [tab, setTab] = useState(0);
  const { todayMetrics, weeklyData } = useMetricsStore();
  const { sleep } = todayMetrics;
  const h = Math.floor(sleep);
  const m = Math.round((sleep - h) * 60);
  const quality = Math.min(100, Math.round((sleep / 8) * 90 + 10));
  const weekSleep = weeklyData.map(d => d.sleep);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Sleep architecture segments (proportional)
  const stages = [
    { label: 'REM Sleep',   dur: '1h 12m', pct: 15, color: COLORS.sleepREM },
    { label: 'Deep Sleep',  dur: '2h 05m', pct: 25, color: COLORS.sleepDeep },
    { label: 'Light Sleep', dur: '3h 45m', pct: 45, color: '#C5CBD8' },
    { label: 'Awake',       dur: '18m',    pct: 15, color: '#F0F2F5' },
  ];

  const qualityLabel = quality >= 90 ? 'EXCELLENT' : quality >= 75 ? 'GOOD' : quality >= 60 ? 'FAIR' : 'POOR';
  const qualityColor = quality >= 90 ? COLORS.secondary : quality >= 75 ? '#27AE60' : '#F5A623';

  return (
    <SafeAreaView style={ds.container} edges={['top']}>
      <Header title="Sleep" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>

        {/* Tabs */}
        <View style={{ marginTop: SPACING.md }}>
          <Tabs items={['Day', 'Week', 'Month']} active={tab} onSelect={setTab} />
        </View>

        {/* Total duration */}
        <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center', paddingVertical: SPACING.xl }]}>
          <Text style={slp.durationLabel}>TOTAL DURATION</Text>
          <View style={slp.durationRow}>
            <Text style={slp.durationNum}>{h}h</Text>
            <Text style={slp.durationMin}> {m}m</Text>
          </View>
          <View style={slp.trendBadge}>
            <Ionicons name="trending-up" size={12} color={COLORS.secondary} />
            <Text style={slp.trendText}>+12% vs last night</Text>
          </View>
        </View>

        {/* Quality score */}
        <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
          <View style={slp.qualityRow}>
            <Text style={slp.qualityTitle}>SLEEP QUALITY SCORE</Text>
            <View style={[slp.qualityBadge, { backgroundColor: qualityColor + '20' }]}>
              <Text style={[slp.qualityBadgeText, { color: qualityColor }]}>{qualityLabel}</Text>
            </View>
          </View>
          <View style={slp.scoreRow}>
            <Text style={slp.score}>{quality}</Text>
            <Text style={slp.scoreOf}>/100</Text>
          </View>
          {/* Score dots */}
          <View style={slp.dotsRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} style={[slp.scoreDot, {
                backgroundColor: i < Math.round(quality / 12.5)
                  ? (i >= 6 ? COLORS.sleepDeep : i >= 4 ? COLORS.secondary : '#C5CBD8')
                  : COLORS.border,
                width: i >= 6 ? 18 : 12,
                height: i >= 6 ? 18 : 12,
                borderRadius: i >= 6 ? 9 : 6,
              }]} />
            ))}
          </View>
        </View>

        {/* Bedtime / Wake up */}
        <View style={slp.timeRow}>
          <View style={[slp.timeCard, SHADOWS.sm]}>
            <View style={[slp.timeIcon, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="moon" size={18} color={COLORS.primary} />
            </View>
            <Text style={slp.timeLabel}>BEDTIME</Text>
            <Text style={slp.timeVal}>22:45</Text>
            <Text style={slp.timeSub}>-15min late</Text>
          </View>
          <View style={[slp.timeCard, SHADOWS.sm]}>
            <View style={[slp.timeIcon, { backgroundColor: COLORS.secondary + '15' }]}>
              <Ionicons name="sunny" size={18} color={COLORS.secondary} />
            </View>
            <Text style={slp.timeLabel}>WAKE UP</Text>
            <Text style={slp.timeVal}>06:05</Text>
            <Text style={[slp.timeSub, { color: COLORS.secondary }]}>On time</Text>
          </View>
        </View>

        {/* Sleep architecture */}
        <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
          <Text style={slp.archTitle}>SLEEP ARCHITECTURE</Text>
          {/* Stacked bar */}
          <View style={slp.archBar}>
            {stages.map((st, i) => (
              <View key={i} style={{ flex: st.pct, backgroundColor: st.color }} />
            ))}
          </View>
          {stages.map((st, i) => (
            <View key={i} style={slp.archRow}>
              <View style={[slp.archDot, { backgroundColor: st.color, borderWidth: st.color === '#F0F2F5' ? 1 : 0, borderColor: COLORS.border }]} />
              <Text style={slp.archLabel}>{st.label}</Text>
              <Text style={slp.archDur}>{st.dur} ({st.pct}%)</Text>
            </View>
          ))}
        </View>

        {/* Sleep trends */}
        <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
          <Text style={slp.archTitle}>SLEEP TRENDS</Text>
          <BarChart data={weekSleep} labels={dayLabels} color={COLORS.sleepDeep} height={80} highlight={5} />
        </View>

        {/* Insight */}
        <View style={[slp.insightCard, SHADOWS.sm, { marginHorizontal: SPACING.lg }]}>
          <Ionicons name="bulb-outline" size={18} color="#F5A623" style={{ marginBottom: 6 }} />
          <Text style={slp.insightText}>
            "Your body recovers most during Deep Sleep. You achieved 15% more tonight."
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const slp = StyleSheet.create({
  durationLabel: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: SPACING.sm },
  durationRow: { flexDirection: 'row', alignItems: 'flex-end' },
  durationNum: { fontFamily: FONTS.black, fontSize: 64, color: COLORS.textDark, lineHeight: 70 },
  durationMin: { fontFamily: FONTS.bold, fontSize: 36, color: COLORS.textMuted, marginBottom: 8 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.secondary + '15', borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4, marginTop: SPACING.sm },
  trendText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.secondary, marginLeft: 4 },
  qualityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  qualityTitle: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.2 },
  qualityBadge: { borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4 },
  qualityBadgeText: { fontFamily: FONTS.bold, fontSize: 11, letterSpacing: 0.5 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: SPACING.md },
  score: { fontFamily: FONTS.black, fontSize: 52, color: COLORS.textDark, lineHeight: 58 },
  scoreOf: { fontFamily: FONTS.medium, fontSize: 20, color: COLORS.textMuted, marginBottom: 8, marginLeft: 4 },
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  scoreDot: { marginRight: 6 },
  timeRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  timeCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, alignItems: 'center', marginHorizontal: 4 },
  timeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  timeLabel: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.2 },
  timeVal: { fontFamily: FONTS.black, fontSize: 24, color: COLORS.textDark },
  timeSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  archTitle: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: SPACING.md },
  archBar: { flexDirection: 'row', height: 20, borderRadius: 6, overflow: 'hidden', marginBottom: SPACING.lg },
  archRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  archDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
  archLabel: { flex: 1, fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMid },
  archDur: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted },
  insightCard: { backgroundColor: '#FFFDF0', borderRadius: RADIUS.card, padding: SPACING.lg, borderLeftWidth: 3, borderLeftColor: '#F5A623' },
  insightText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMid, lineHeight: 20, fontStyle: 'italic' },
});

/* ════════════════════════════════════════════════════════════════════════════════
   STEP DETAIL SCREEN
   Stitch: large count, goal ring, hourly bars, weekly comparison
════════════════════════════════════════════════════════════════════════════════ */
export function StepDetailScreen({ navigation }) {
  const [tab, setTab] = useState(0);
  const { todayMetrics, weeklyData } = useMetricsStore();
  const goal = 10000;
  const pct = Math.min(todayMetrics.steps / goal, 1);
  const weekSteps = weeklyData.map(d => d.steps);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const hourlySteps = [0,0,0,0,0,0,120,450,800,600,400,350,500,700,550,400,300,600,350,200,100,80,0,0];

  return (
    <SafeAreaView style={ds.container} edges={['top']}>
      <Header title="Steps" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>

        {/* Hero */}
        <View style={[ds.card, SHADOWS.md, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, alignItems: 'center', paddingVertical: SPACING.xl }]}>
          <Text style={stp.heroLabel}>TODAY'S STEPS</Text>
          <Text style={stp.heroNum}>{todayMetrics.steps.toLocaleString()}</Text>
          <Text style={stp.heroGoal}>of {goal.toLocaleString()} goal</Text>
          {/* Big progress track */}
          <View style={stp.bigTrack}>
            <View style={[stp.bigFill, { width: `${Math.round(pct * 100)}%` }]} />
          </View>
          <Text style={stp.pctText}>{Math.round(pct * 100)}% complete</Text>
          {/* Derived stats */}
          <View style={stp.derivedRow}>
            <View style={stp.derivedItem}>
              <Ionicons name="navigate-outline" size={16} color={COLORS.secondary} />
              <Text style={stp.derivedVal}>{(todayMetrics.steps * 0.000762).toFixed(1)} km</Text>
              <Text style={stp.derivedLbl}>Distance</Text>
            </View>
            <View style={stp.derivedDivider} />
            <View style={stp.derivedItem}>
              <Ionicons name="flame-outline" size={16} color={COLORS.primary} />
              <Text style={stp.derivedVal}>{Math.round(todayMetrics.steps * 0.04)}</Text>
              <Text style={stp.derivedLbl}>Calories</Text>
            </View>
            <View style={stp.derivedDivider} />
            <View style={stp.derivedItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
              <Text style={stp.derivedVal}>{Math.round(todayMetrics.steps / 100)} min</Text>
              <Text style={stp.derivedLbl}>Active</Text>
            </View>
          </View>
        </View>

        <Tabs items={['Day', 'Week', 'Month']} active={tab} onSelect={setTab} />

        {tab === 0 && (
          <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
            <Text style={ds.sectionTitle}>Hourly Activity</Text>
            <BarChart data={hourlySteps} labels={['6','8','10','12','14','16','18','20']} color={COLORS.secondary} height={100} highlight={6} />
          </View>
        )}
        {tab === 1 && (
          <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
            <Text style={ds.sectionTitle}>This Week</Text>
            <BarChart data={weekSteps} labels={dayLabels} color={COLORS.secondary} height={100} highlight={5} />
          </View>
        )}

        <StatCards items={[
          { value: Math.round(weekSteps.reduce((a,b)=>a+b,0)/7).toLocaleString(), label: 'Daily Avg', color: COLORS.secondary },
          { value: Math.max(...weekSteps).toLocaleString(), label: 'Best Day' },
          { value: `${weekSteps.filter(v=>v>=goal).length}/7`, label: 'Goals Met' },
        ]} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const stp = StyleSheet.create({
  heroLabel: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: SPACING.sm },
  heroNum: { fontFamily: FONTS.black, fontSize: 60, color: COLORS.textDark, letterSpacing: -2, lineHeight: 66 },
  heroGoal: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.lg },
  bigTrack: { width: '100%', height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  bigFill: { height: 10, backgroundColor: COLORS.secondary, borderRadius: 5 },
  pctText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.secondary, marginBottom: SPACING.lg },
  derivedRow: { flexDirection: 'row', width: '100%', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  derivedItem: { flex: 1, alignItems: 'center' },
  derivedVal: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark, marginTop: 4 },
  derivedLbl: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted },
  derivedDivider: { width: 1, backgroundColor: COLORS.border },
});

/* ════════════════════════════════════════════════════════════════════════════════
   CALORIES DETAIL SCREEN
   Stitch: net balance header, metabolic flow (line chart), daily stats, consistency log
════════════════════════════════════════════════════════════════════════════════ */
export function CaloriesDetailScreen({ navigation }) {
  const [tab, setTab] = useState(1); // Week default like Stitch
  const { todayMetrics, weeklyData } = useMetricsStore();
  const { caloriesBurned, caloriesConsumed } = todayMetrics;
  const net = caloriesConsumed - caloriesBurned;
  const isDeficit = net < 0;

  const weekBurned = weeklyData.map(d => d.caloriesBurned);
  const weekConsumed = weeklyData.map(d => d.water * 780); // Simulated consumed
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const { width } = useWindowDimensions();
  const chartW = width - SPACING.lg * 2 - SPACING.lg * 2;

  return (
    <SafeAreaView style={ds.container} edges={['top']}>
      <Header title="Calories" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>

        {/* Net balance hero */}
        <View style={[cal.netCard, SHADOWS.md, { marginHorizontal: SPACING.lg }]}>
          <Text style={cal.netLabel}>CURRENT NET BALANCE</Text>
          <Text style={[cal.netValue, { color: isDeficit ? COLORS.secondary : COLORS.primary }]}>
            {isDeficit ? '' : '+'}{net.toLocaleString()} <Text style={cal.netUnit}>kcal</Text>
          </Text>
          <Text style={cal.netDesc}>
            Your metabolic {isDeficit ? 'deficit' : 'surplus'} is tracking{' '}
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.textDark }}>12% higher</Text>
            {' '}than last {dayLabels[new Date().getDay() - 1] || 'Tuesday'}. Clinical optimum reached for fat oxidation.
          </Text>
        </View>

        <Tabs items={['Day', 'Week', 'Month', 'Year']} active={tab} onSelect={setTab} />

        {/* Metabolic flow chart */}
        <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }]}>
          <Text style={cal.chartTitle}>Metabolic Flow</Text>
          <Text style={cal.chartSub}>BURNED VS. CONSUMED</Text>
          {/* Simple line chart using SVG */}
          <MetabolicChart burned={weekBurned} consumed={weekConsumed} labels={dayLabels} width={chartW} />
          {/* Legend */}
          <View style={cal.legendRow}>
            <View style={cal.legendItem}>
              <View style={[cal.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={cal.legendText}>Burned</Text>
            </View>
            <View style={cal.legendItem}>
              <View style={[cal.legendDot, { backgroundColor: COLORS.secondary }]} />
              <Text style={cal.legendText}>Consumed</Text>
            </View>
          </View>
        </View>

        {/* Today stats */}
        <View style={cal.statsRow}>
          <View style={[cal.statBox, SHADOWS.sm, { borderLeftColor: COLORS.secondary }]}>
            <Ionicons name="restaurant-outline" size={22} color={COLORS.secondary} />
            <Text style={cal.statNum}>{caloriesConsumed.toLocaleString()}</Text>
            <Text style={cal.statLbl}>CONSUMED</Text>
          </View>
          <View style={[cal.statBox, SHADOWS.sm, { borderLeftColor: COLORS.primary }]}>
            <Ionicons name="flame-outline" size={22} color={COLORS.primary} />
            <Text style={cal.statNum}>{caloriesBurned.toLocaleString()}</Text>
            <Text style={cal.statLbl}>BURNED</Text>
          </View>
        </View>

        {/* Consistency log */}
        <View style={[ds.card, SHADOWS.sm, { marginHorizontal: SPACING.lg }]}>
          <View style={cal.logHeader}>
            <Text style={cal.logTitle}>Consistency Log</Text>
            <Text style={cal.logMonth}>APRIL ▾</Text>
          </View>
          <CalConsistencyGrid />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetabolicChart({ burned, consumed, labels, width }) {
  const h = 140;
  const padLeft = 10;
  const padRight = 10;
  const chartW = width - padLeft - padRight;
  const max = Math.max(...burned, ...consumed, 100);
  const pts = (arr) => arr.map((v, i) => {
    const x = padLeft + (i / (arr.length - 1)) * chartW;
    const y = h - (v / max) * (h - 20) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={width} height={h + 30}>
      <Polyline points={pts(burned)} stroke={COLORS.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      {burned.map((v, i) => {
        const x = padLeft + (i / (burned.length - 1)) * chartW;
        const y = h - (v / max) * (h - 20) - 5;
        return <Circle key={i} cx={x} cy={y} r={4} fill={COLORS.primary} />;
      })}
      <Polyline points={pts(consumed)} stroke={COLORS.secondary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
      {consumed.map((v, i) => {
        const x = padLeft + (i / (consumed.length - 1)) * chartW;
        const y = h - (v / max) * (h - 20) - 5;
        return <Circle key={i} cx={x} cy={y} r={3} fill={COLORS.secondary} />;
      })}
    </Svg>
  );
}

function CalConsistencyGrid() {
  const today = new Date();
  const month = Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    const isToday = d === today.getDate();
    const isPast = d < today.getDate();
    const isMet = isPast && Math.random() > 0.3;
    return { d, isToday, isMet };
  });
  return (
    <View style={cal.calGrid}>
      {month.map(({ d, isToday, isMet }) => (
        <View
          key={d}
          style={[
            cal.calCell,
            isMet && { backgroundColor: COLORS.secondary },
            isToday && { backgroundColor: COLORS.primary },
          ]}
        >
          <Text style={[cal.calNum, (isMet || isToday) && { color: '#fff' }]}>{d}</Text>
        </View>
      ))}
    </View>
  );
}

const cal = StyleSheet.create({
  netCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.lg },
  netLabel: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: SPACING.sm },
  netValue: { fontFamily: FONTS.black, fontSize: 56, letterSpacing: -2, lineHeight: 62 },
  netUnit: { fontSize: 24, fontFamily: FONTS.bold },
  netDesc: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginTop: SPACING.sm },
  chartTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  chartSub: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: SPACING.md },
  legendRow: { flexDirection: 'row', marginTop: SPACING.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted },
  statsRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  statBox: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, alignItems: 'center', marginHorizontal: 4, borderLeftWidth: 3 },
  statNum: { fontFamily: FONTS.black, fontSize: 28, color: COLORS.textDark, marginTop: 6 },
  statLbl: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.2 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  logTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  logMonth: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.primary },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '13.5%', aspectRatio: 1, margin: '0.4%', borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.border },
  calNum: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted },
});

/* ════════════════════════════════════════════════════════════════════════════════
   WORKOUT WEEK DETAIL
════════════════════════════════════════════════════════════════════════════════ */
export function WorkoutWeekDetailScreen({ navigation }) {
  const { workoutLogs, routines } = useWorkoutStore();
  const recent = workoutLogs.slice(0, 10);
  const totalMin = workoutLogs.reduce((s, l) => s + (l.duration || 0), 0);

  return (
    <SafeAreaView style={ds.container} edges={['top']}>
      <Header title="Workouts" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={ds.scroll}>
        <StatCards items={[
          { value: workoutLogs.length, label: 'Sessions', color: COLORS.secondary },
          { value: `${Math.floor(totalMin/60)}h`, label: 'Total Time' },
          { value: `${Math.round(workoutLogs.reduce((s,l)=>s+l.effort,0)/Math.max(workoutLogs.length,1))}/10`, label: 'Avg Effort' },
        ]} />
        <Text style={[ds.sectionTitle, { paddingHorizontal: SPACING.lg }]}>Recent Sessions</Text>
        {recent.map(log => {
          const r = routines.find(rt => rt.id === log.routineId);
          return (
            <View key={log.id} style={[ds.logRow, { marginHorizontal: SPACING.lg }, SHADOWS.sm]}>
              <View style={[ds.logIcon, { backgroundColor: COLORS.secondary + '18' }]}>
                <Ionicons name="barbell-outline" size={18} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={ds.logTitle2}>{r?.title || 'Workout'}</Text>
                <Text style={ds.logSub}>{log.date} · {log.duration} min</Text>
              </View>
              <View style={[ds.effortBadge, { backgroundColor: COLORS.primary + '15' }]}>
                <Text style={[ds.effortText, { color: COLORS.primary }]}>{log.effort}/10</Text>
              </View>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   READINESS DETAIL SCREEN
   Stitch: Custom Header, Main Donut, Trends, Sleep/Fatigue summaries, Protocol Insights
════════════════════════════════════════════════════════════════════════════════ */
function ReadinessHeader({ onBack }) {
  return (
    <View style={rd.header}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        <Text style={rd.headerTitle}>Readiness Score</Text>
      </TouchableOpacity>
      <View style={rd.headerRight}>
        <Ionicons name="notifications" size={20} color="#FF7B6E" style={{ marginRight: SPACING.md }} />
        {/* Avatar circle */}
        <View style={rd.avatar}>
          <Text style={rd.avatarText}>A</Text>
        </View>
      </View>
    </View>
  );
}

export function ReadinessDetailScreen({ navigation }) {
  const [tab, setTab] = useState(1); // Week is default active 

  return (
    <SafeAreaView style={ds.container} edges={['top']}>
      <ReadinessHeader onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[ds.scroll, { paddingHorizontal: 0, paddingBottom: 60 }]}>
        
        {/* Tabs */}
        <View style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.xl }}>
          <Tabs items={['Day', 'Week', 'Month', 'Year']} active={tab} onSelect={setTab} />
        </View>

        {/* Readiness Circle Chart */}
        <View style={rd.heroChartArea}>
          <DonutChart size={200} strokeWidth={16} percentage={82} color="#FF7B6E" value="82" label="" />
          {/* Note: since DonutChart has value and label inside, we can just overlay "READY" manually or use DonutChart. Our donutchart component centers text. We'll use absolute position for "READY" to match the mock. */}
          <Text style={rd.heroReadyText}>READY</Text>

          {/* Prime Condition Badge */}
          <View style={rd.primeBadge}>
            <View style={rd.primeDot} />
            <Text style={rd.primeText}>Prime Condition</Text>
          </View>
        </View>

        {/* Insight Paragraph */}
        <Text style={rd.insightParagraph}>
          Your metabolic recovery is 1.2% higher than your 7-day average. Today is optimal for a PR attempt.
        </Text>

        {/* Weekly Trend Section */}
        <View style={rd.trendsHeader}>
          <Text style={rd.trendsTitle}>Weekly Trend</Text>
          <Text style={rd.trendsGrowth}>+4.2% GROWTH</Text>
        </View>
        
        {/* Chart Box */}
        <View style={[ds.card, rd.chartBox, SHADOWS.sm]}>
          <View style={{ flex: 1 }} />
          <View style={rd.chartLabels}>
             {['M','T','W','T','F','S','S'].map((day,i) => (
                <Text key={i} style={[rd.chartLabelDay, i===3 && {color: '#FF7B6E'}]}>{day}</Text>
             ))}
          </View>
        </View>

        {/* Side by side mini stats */}
        <View style={rd.statsRow}>
          {/* Sleep */}
          <View style={[ds.card, rd.statCard, SHADOWS.sm]}>
            <View style={rd.statTopRow}>
               <Ionicons name="moon" size={16} color="#11664D" />
               <Text style={rd.statLabel}>SLEEP</Text>
            </View>
            <Text style={rd.statValue}>8h 12m</Text>
            <Text style={rd.statSubGreen}>EXCELLENT</Text>
          </View>

          {/* Fatigue */}
          <View style={[ds.card, rd.statCard, SHADOWS.sm, { marginLeft: SPACING.md }]}>
            <View style={rd.statTopRow}>
               <Ionicons name="flash" size={16} color="#A23B2A" />
               <Text style={rd.statLabel}>FATIGUE</Text>
            </View>
            <Text style={rd.statValue}>Low</Text>
            <Text style={rd.statSubRed}>OPTIMAL</Text>
          </View>
        </View>

        {/* Previous Activity */}
        <View style={[ds.card, rd.activityCard, SHADOWS.sm]}>
          <View style={rd.activityIconArea}>
            <Ionicons name="time-outline" size={20} color="#11664D" />
          </View>
          <View style={rd.activityMid}>
            <Text style={rd.activityLabel}>PREVIOUS ACTIVITY</Text>
            <Text style={rd.activityValue}>Leg Day (Heavy)</Text>
          </View>
          <Text style={rd.activitySubGreen}>-15% Load</Text>
        </View>

        {/* Daily Insights Protocol */}
        <LinearGradient 
           colors={['#A23B2A', '#832B1E']} 
           start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
           style={[rd.protocolCard, SHADOWS.md]}
        >
          <View style={rd.protocolHeader}>
            <Ionicons name="document-text" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={rd.protocolTitle}>DAILY INSIGHTS</Text>
          </View>
          <Text style={rd.protocolText}>
            "Your HRV baseline suggests central nervous system readiness. Focus on high-intensity compound movements today, but prioritize 500mg extra sodium for electrolyte balance."
          </Text>
          <View style={rd.protocolFooter}>
            <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.6)" style={{ marginRight: 4 }} />
            <Text style={rd.protocolFooterText}>REPCRAFT MEDICAL PROTOCOL</Text>
          </View>
        </LinearGradient>

      </ScrollView>
    </SafeAreaView>
  );
}

const rd = StyleSheet.create({
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, 
    backgroundColor: COLORS.background 
  },
  headerTitle: { fontFamily: FONTS.black, fontSize: 18, color: COLORS.textDark, marginLeft: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E232A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONTS.bold, fontSize: 12, color: '#fff' },

  heroChartArea: { alignItems: 'center', marginBottom: SPACING.lg, position: 'relative' },
  heroReadyText: { 
    position: 'absolute', top: 120, 
    fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5 
  },
  primeBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FDECEA', borderRadius: RADIUS.pill,
    paddingHorizontal: 12, paddingVertical: 6,
    marginTop: -8, // pull up into the chart gap
  },
  primeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF7B6E', marginRight: 6 },
  primeText: { fontFamily: FONTS.bold, fontSize: 12, color: '#A23B2A' },

  insightParagraph: {
    fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMid,
    textAlign: 'center', lineHeight: 20,
    marginHorizontal: SPACING.xl, marginBottom: SPACING.xxl,
  },

  trendsHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    marginHorizontal: SPACING.lg, marginBottom: SPACING.sm 
  },
  trendsTitle: { fontFamily: FONTS.black, fontSize: 16, color: COLORS.textDark },
  trendsGrowth: { fontFamily: FONTS.bold, fontSize: 11, color: '#11664D', letterSpacing: 0.5 },

  chartBox: { 
    height: 180, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    padding: SPACING.md
  },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 'auto' },
  chartLabelDay: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textDark },

  statsRow: { flexDirection: 'row', marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  statCard: { flex: 1, padding: SPACING.lg },
  statTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.lg },
  statLabel: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textDark, letterSpacing: 0.5 },
  statValue: { fontFamily: FONTS.black, fontSize: 24, color: COLORS.textDark, marginBottom: 4 },
  statSubGreen: { fontFamily: FONTS.bold, fontSize: 10, color: '#11664D' },
  statSubRed: { fontFamily: FONTS.bold, fontSize: 10, color: '#A23B2A' },

  activityCard: { 
    flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg, 
    marginBottom: SPACING.lg, padding: SPACING.lg 
  },
  activityIconArea: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F3EE',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md 
  },
  activityMid: { flex: 1 },
  activityLabel: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5, marginBottom: 2 },
  activityValue: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  activitySubGreen: { fontFamily: FONTS.bold, fontSize: 14, color: '#11664D' },

  protocolCard: {
    marginHorizontal: SPACING.lg, borderRadius: RADIUS.card, padding: SPACING.xl,
  },
  protocolHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  protocolTitle: { fontFamily: FONTS.bold, fontSize: 11, color: '#fff', letterSpacing: 1 },
  protocolText: { fontFamily: FONTS.regular, fontSize: 14, color: '#fff', lineHeight: 22, marginBottom: SPACING.xl, fontStyle: 'italic' },
  protocolFooter: { flexDirection: 'row', alignItems: 'center', paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  protocolFooterText: { fontFamily: FONTS.bold, fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 },
});

/* ════════════════════════════════════════════════════════════════════════════════
   DAILY TARGETS DETAIL SCREEN
   Stitch: Custom Header, Dual Stacked Donuts, Macro Bars, Meal Timing List, Update Targets Button
════════════════════════════════════════════════════════════════════════════════ */
function DailyTargetsHeader({ onBack }) {
  return (
    <View style={dt_det.header}>
      <TouchableOpacity onPress={onBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        <Text style={dt_det.headerTitle}>Daily Targets</Text>
      </TouchableOpacity>
      <View style={dt_det.headerRight}>
        <Ionicons name="notifications" size={20} color="#7BA0A8" style={{ marginRight: SPACING.md }} />
        <View style={dt_det.avatar}>
          <Text style={dt_det.avatarText}>A</Text>
        </View>
      </View>
    </View>
  );
}

export function DailyTargetsDetailScreen({ navigation }) {
  return (
    <SafeAreaView style={ds.container} edges={['top']}>
      <DailyTargetsHeader onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[ds.scroll, { paddingHorizontal: SPACING.lg, paddingBottom: 60 }]}>
        
        {/* Main Dual Donut Card */}
        <View style={[ds.card, SHADOWS.card, dt_det.mainCard]}>
          {/* Top Donut - Calories */}
          <View style={dt_det.donutWrapper}>
            <DonutChart size={180} strokeWidth={14} percentage={76} color="#FF7B6E" value="1,840" label="" />
            {/* Custom Center labels since standard DonutChart is simple */}
            <View style={dt_det.donutCenterText}>
              <Text style={dt_det.donutCenterNum}>1,840</Text>
              <Text style={dt_det.donutCenterSub}>KCAL LEFT</Text>
            </View>
            <Text style={dt_det.donutBottomLabel}>Target: <Text style={{ fontFamily: FONTS.bold }}>2,400</Text></Text>
          </View>

          {/* Bottom Donut - Protein */}
          <View style={dt_det.donutWrapper}>
            <DonutChart size={180} strokeWidth={14} percentage={75} color="#11664D" value="112" label="" />
            <View style={dt_det.donutCenterText}>
              <Text style={dt_det.donutCenterNum}>112<Text style={dt_det.donutCenterUnit}> g</Text></Text>
              <Text style={dt_det.donutCenterSub}>PROTEIN</Text>
            </View>
            <Text style={dt_det.donutBottomLabel}>Goal: <Text style={{ fontFamily: FONTS.bold }}>150g</Text></Text>
          </View>
        </View>

        {/* Macros Row */}
        <View style={dt_det.macrosRow}>
          {/* Carbs */}
          <View style={[ds.card, SHADOWS.sm, dt_det.macroCard]}>
             <View style={dt_det.macroContent}>
               <Text style={dt_det.macroLabel}>CARBOHYDRATES</Text>
               <Text style={dt_det.macroValue}>220g</Text>
             </View>
             <View style={dt_det.macroBarBg}>
               <View style={[dt_det.macroBarFill, { backgroundColor: '#4ECDC4', height: '70%' }]} />
             </View>
          </View>
          {/* Fats */}
          <View style={[ds.card, SHADOWS.sm, dt_det.macroCard, { marginLeft: SPACING.md }]}>
             <View style={dt_det.macroContent}>
               <Text style={dt_det.macroLabel}>FATS</Text>
               <Text style={dt_det.macroValue}>55g</Text>
             </View>
             <View style={dt_det.macroBarBg}>
               <View style={[dt_det.macroBarFill, { backgroundColor: '#D9827B', height: '65%' }]} />
             </View>
          </View>
        </View>

        {/* Meal Timing */}
        <View style={dt_det.sectionHeader}>
          <Text style={dt_det.sectionTitle}>Meal Timing</Text>
          <Text style={dt_det.sectionSub}>OPTIMAL DIST.</Text>
        </View>

        {/* Breakfast Card */}
        <View style={[ds.card, SHADOWS.sm, dt_det.mealCard]}>
          <View style={[dt_det.mealIconBox, { backgroundColor: '#FDF1EF' }]}>
            <Ionicons name="sunny" size={20} color="#A23B2A" />
          </View>
          <View style={dt_det.mealMid}>
             <View style={dt_det.mealTitleRow}>
               <View>
                 <Text style={dt_det.mealTitle}>Breakfast</Text>
                 <View style={[dt_det.mealUnderline, { backgroundColor: '#A23B2A', width: 68 }]} />
               </View>
               <Text style={[dt_det.mealKcal, { color: '#A23B2A' }]}>600 kcal</Text>
             </View>
             <View style={dt_det.mealFooterRow}>
               <Text style={dt_det.mealRec}>RECOMMENDED: 25%</Text>
               <Text style={dt_det.mealTime}>07:00 - 09:00</Text>
             </View>
          </View>
        </View>

        {/* Lunch Card */}
        <View style={[ds.card, SHADOWS.sm, dt_det.mealCard]}>
          <View style={[dt_det.mealIconBox, { backgroundColor: '#EBF4F1' }]}>
            <Ionicons name="partly-sunny" size={20} color="#11664D" />
          </View>
          <View style={dt_det.mealMid}>
             <View style={dt_det.mealTitleRow}>
               <View>
                 <Text style={dt_det.mealTitle}>Lunch</Text>
                 <View style={[dt_det.mealUnderline, { backgroundColor: '#11664D', width: 45 }]} />
               </View>
               <Text style={[dt_det.mealKcal, { color: '#11664D' }]}>840 kcal</Text>
             </View>
             <View style={dt_det.mealFooterRow}>
               <Text style={dt_det.mealRec}>RECOMMENDED: 35%</Text>
               <Text style={dt_det.mealTime}>12:30 - 14:00</Text>
             </View>
          </View>
        </View>

        {/* Dinner Card */}
        <View style={[ds.card, SHADOWS.sm, dt_det.mealCard]}>
          <View style={[dt_det.mealIconBox, { backgroundColor: '#EBF4F1' }]}>
            <Ionicons name="moon" size={20} color="#11664D" />
          </View>
          <View style={dt_det.mealMid}>
             <View style={dt_det.mealTitleRow}>
               <View>
                 <Text style={dt_det.mealTitle}>Dinner</Text>
                 <View style={[dt_det.mealUnderline, { backgroundColor: '#11664D', width: 48 }]} />
               </View>
               <Text style={[dt_det.mealKcal, { color: '#11664D' }]}>720 kcal</Text>
             </View>
             <View style={dt_det.mealFooterRow}>
               <Text style={dt_det.mealRec}>RECOMMENDED: 30%</Text>
               <Text style={dt_det.mealTime}>19:00 - 20:30</Text>
             </View>
          </View>
        </View>

        {/* Update Targets Button */}
        <TouchableOpacity style={dt_det.updateBtn}>
          <LinearGradient
            colors={['#8B2416', '#FF7B6E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={dt_det.updateBtnGrad}
          >
            <Text style={dt_det.updateBtnText}>Update Targets</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={dt_det.updateSub}>
          Adjusting targets will recalibrate your AI meal plans for the remainder of the week.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const dt_det = StyleSheet.create({
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, 
    backgroundColor: COLORS.background 
  },
  headerTitle: { fontFamily: FONTS.black, fontSize: 18, color: COLORS.textDark, marginLeft: 10 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1E232A', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: FONTS.bold, fontSize: 12, color: '#fff' },

  mainCard: { paddingVertical: SPACING.xxl, marginBottom: SPACING.lg, alignItems: 'center' },
  donutWrapper: { alignItems: 'center', marginBottom: SPACING.xl },
  donutCenterText: { position: 'absolute', top: 62, alignItems: 'center', backgroundColor: '#fff', width: 140 },
  donutCenterNum: { fontFamily: FONTS.black, fontSize: 34, color: COLORS.textDark, lineHeight: 40 },
  donutCenterUnit: { fontSize: 20, fontFamily: FONTS.bold },
  donutCenterSub: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.2 },
  donutBottomLabel: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMid, marginTop: SPACING.lg },

  macrosRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  macroCard: { flex: 1, flexDirection: 'row', padding: SPACING.lg, alignItems: 'center', justifyContent: 'space-between' },
  macroContent: { flex: 1 },
  macroLabel: { fontFamily: FONTS.bold, fontSize: 9, color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 4 },
  macroValue: { fontFamily: FONTS.black, fontSize: 22, color: COLORS.textDark },
  macroBarBg: { width: 6, height: 38, backgroundColor: '#F0F2F5', borderRadius: 3, justifyContent: 'flex-end', marginLeft: SPACING.md },
  macroBarFill: { width: 6, borderRadius: 3 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.md, marginTop: SPACING.md },
  sectionTitle: { fontFamily: FONTS.black, fontSize: 18, color: COLORS.textDark },
  sectionSub: { fontFamily: FONTS.bold, fontSize: 10, color: '#A23B2A', letterSpacing: 1 },

  mealCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, marginBottom: SPACING.md },
  mealIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  mealMid: { flex: 1 },
  mealTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SPACING.sm },
  mealTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  mealUnderline: { height: 3, borderRadius: 1.5, marginTop: 4 },
  mealKcal: { fontFamily: FONTS.bold, fontSize: 13 },
  mealFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealRec: { fontFamily: FONTS.regular, fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.5 },
  mealTime: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textMuted },

  updateBtn: { borderRadius: RADIUS.button, overflow: 'hidden', marginTop: SPACING.xl, marginBottom: SPACING.md },
  updateBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  updateBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },
  updateSub: { fontFamily: FONTS.regular, fontSize: 11, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: SPACING.xl, lineHeight: 18 },
});

/* ─── Shared styles ──────────────────────────────────────────────────────────── */
const ds = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingTop: SPACING.lg },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, marginBottom: SPACING.sm },
  heroCard: { marginHorizontal: SPACING.lg, borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.lg },
  heroLabel: { fontFamily: FONTS.medium, fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: SPACING.sm },
  heroValue: { fontFamily: FONTS.black, fontSize: 64, color: '#fff', letterSpacing: -2, lineHeight: 70 },
  heroUnit: { fontFamily: FONTS.bold, fontSize: 28, color: 'rgba(255,255,255,0.8)', marginBottom: 8, marginLeft: 4 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-end' },
  heroSub: { fontFamily: FONTS.regular, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: SPACING.md },
  heroTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden', marginBottom: SPACING.sm },
  heroFill: { height: 6, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 3 },
  addWaterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: RADIUS.pill, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start', marginTop: SPACING.sm },
  addWaterText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.secondary, marginLeft: 4 },
  logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.md, marginBottom: SPACING.sm },
  logIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logTime: { flex: 1, fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMid, marginLeft: SPACING.sm },
  logVal: { fontFamily: FONTS.bold, fontSize: 14 },
  logTitle2: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  logSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  effortBadge: { borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4 },
  effortText: { fontFamily: FONTS.bold, fontSize: 12 },
});
