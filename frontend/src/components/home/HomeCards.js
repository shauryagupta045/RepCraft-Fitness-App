import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import { useMetricsStore } from '../../store/metricsStore';
import { calculateReadiness } from '../../utils/metricsUtils';


// ─── Shared: Mini Bar Chart (7 bars, Mon-Sun) ─────────────────────────────────
function MiniBarChart({ data, color, maxHeight = 44, barWidth = 10, hideLabels = false }) {
  const max = Math.max(...data, 0.01);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={barStyles.container}>
      <View style={[barStyles.barsRow, { height: maxHeight }]}>
        {data.map((val, i) => {
          const pct = Math.max(val / max, 0.15); // increased min height
          const isToday = i === 5; // Saturday = today in mock data
          const barColor = val > 0 ? color : '#EBEBEB'; // light grey for empty bars
          return (
            <View key={i} style={barStyles.barCol}>
              <View
                style={[
                  barStyles.bar,
                  {
                    width: barWidth,
                    height: maxHeight * pct,
                    backgroundColor: barColor,
                    opacity: 1, // uniform opacity matching design
                    borderRadius: barWidth / 2, // fully rounded pill
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      {!hideLabels && (
        <View style={barStyles.labelsRow}>
          {days.map((d, i) => (
            <Text key={i} style={barStyles.label}>{d}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { width: '100%' },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { borderRadius: 4, minHeight: 4 },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: 9,
    color: COLORS.textMuted,
  },
});

// ─── Donut Chart (SVG-based, web + native) ────────────────────────────────────
export function DonutChart({ size = 95, strokeWidth = 10, percentage = 70, color, label, value }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;
  const center = size / 2;

  return (
    <View style={donutStyles.wrapper}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          {/* Track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={'#EBEBEB'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        {/* Center label and value */}
        <View style={{ alignItems: 'center' }}>
          <Text style={[donutStyles.label, { color }]}>{label}</Text>
          <Text style={donutStyles.value}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  value: {
    fontFamily: FONTS.black,
    fontSize: 22,
    color: '#0A1B28',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 2,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    marginTop: 0,
    textAlign: 'center',
  },
});

// ─── 1. READINESS CARD ────────────────────────────────────────────────────────
export function ReadinessCard({ onPress }) {
  const score = 82; // Matches image exactly
  const sleepStatus = 'OPTIMAL';
  const fatigueStatus = 'LOW';
  const primeLabel = 'PRIME';
  const yesterdayChange = '+12%';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
    >
      <LinearGradient
        colors={['#C95345', '#F57864']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[rcStyles.card, SHADOWS.primary]}
      >
      {/* Top row: DAILY CAPACITY label + PRIME badge */}
      <View style={rcStyles.topRow}>
        <Text style={rcStyles.capacityLabel}>DAILY CAPACITY</Text>
        <View style={[rcStyles.primeBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Ionicons name="flash" size={12} color="#fff" />
          <Text style={rcStyles.primeText}>{primeLabel}</Text>
        </View>
      </View>

      {/* Score number */}
      <Text style={rcStyles.scoreNumber}>{score}</Text>
      <Text style={rcStyles.scoreSubtitle}>Readiness Score</Text>

      {/* Status pills - Stacking text matches image */}
      <View style={rcStyles.pillsRow}>
        <View style={rcStyles.pill}>
          <Text style={rcStyles.pillKey}>SLEEP:</Text>
          <Text style={rcStyles.pillVal}>{sleepStatus}</Text>
        </View>
        <View style={rcStyles.pill}>
          <Text style={rcStyles.pillKey}>FATIGUE:</Text>
          <Text style={rcStyles.pillVal}>{fatigueStatus}</Text>
        </View>
        <View style={rcStyles.pill}>
          <Text style={rcStyles.pillKey}>YESTERDAY:</Text>
          <Text style={rcStyles.pillVal}>{yesterdayChange}</Text>
        </View>
      </View>
    </LinearGradient>
    </TouchableOpacity>
  );
}

const rcStyles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  capacityLabel: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.8,
  },
  primeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  primeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  scoreNumber: {
    fontFamily: FONTS.black,
    fontSize: 84,
    color: '#fff',
    lineHeight: 90,
    letterSpacing: -2,
  },
  scoreSubtitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xl,
    marginTop: -4,
  },
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginRight: 8,
    justifyContent: 'center',
  },
  pillKey: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 2,
  },
  pillVal: {
    fontFamily: FONTS.black,
    fontSize: 11,
    color: '#fff',
  },
});

// ─── 2. STEP COUNTER CARD ─────────────────────────────────────────────────────
export function StepCard({ onPress, weekData = [] }) {
  const steps = 6842;
  const goal = 10000;
  const pct = Math.min(steps / goal, 1);
  const safeWeek = weekData.length === 7 ? weekData : [8200, 5400, 9100, 7300, 8800, steps, 0];
  const GREEN = '#1A8B80';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[scStyles.card, SHADOWS.card]}
    >
      <View style={scStyles.titleRow}>
        <View style={scStyles.titleLeft}>
          <View style={scStyles.iconBox}>
            <Ionicons name="footsteps-outline" size={20} color={GREEN} />
          </View>
          <View>
            <Text style={scStyles.title}>Step Counter</Text>
            <Text style={scStyles.goal}>Goal: {goal.toLocaleString()} steps</Text>
          </View>
        </View>
        <Text style={scStyles.count}>{steps.toLocaleString()}</Text>
      </View>

      <View style={scStyles.progressTrack}>
        <View style={[scStyles.progressFill, { width: `${pct * 100}%`, backgroundColor: GREEN }]} />
        <View style={[scStyles.progressTip, { left: `${Math.min(pct * 100, 97)}%` }]} />
      </View>

      <View style={{ marginTop: SPACING.xl }}>
        <MiniBarChart data={safeWeek} color={GREEN} maxHeight={44} barWidth={24} hideLabels={false} />
      </View>
    </TouchableOpacity>
  );
}

const scStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    paddingVertical: 26,
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F3EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#0A1B28',
    marginBottom: 2,
  },
  goal: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#8A94A6',
  },
  count: {
    fontFamily: FONTS.black,
    fontSize: 42,
    color: '#0A1B28',
    letterSpacing: -1,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#EBEBEB',
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressTip: {
    position: 'absolute',
    top: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8066',
    marginLeft: -4,
  },
});

// ─── 3. DAILY CALORIES CARD ───────────────────────────────────────────────────
export function CaloriesCard({ onPress }) {
  const caloriesBurned = 420;
  const caloriesConsumed = 1840;
  const net = caloriesConsumed - caloriesBurned;
  const maxCal = 2400;
  const burnedPct = Math.round((caloriesBurned / maxCal) * 100);
  const consumedPct = Math.round((caloriesConsumed / maxCal) * 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[ccStyles.card, SHADOWS.card]}
    >
      <Text style={ccStyles.title}>Daily Calories</Text>

      <View style={ccStyles.chartsRow}>
        <DonutChart
          size={110}
          strokeWidth={11}
          percentage={burnedPct}
          color="#FF7F50"
          value={caloriesBurned.toString()}
          label="Burned"
        />
        <DonutChart
          size={110}
          strokeWidth={11}
          percentage={consumedPct}
          color="#0A8574"
          value={caloriesConsumed.toLocaleString()}
          label="Consumed"
        />
      </View>

      <View style={ccStyles.netBox}>
        <Text style={ccStyles.netLabel}>NET BALANCE</Text>
        <Text style={ccStyles.netValue}>
          {net > 0 ? '+' : ''}{net.toLocaleString()} kcal
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const ccStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    paddingVertical: 26,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0A1B28',
    marginBottom: SPACING.xl,
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl + 8,
  },
  netBox: { 
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    paddingVertical: 18,
    borderRadius: 12,
  },
  netLabel: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#9E3C2B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  netValue: {
    fontFamily: FONTS.black,
    fontSize: 26,
    color: '#0A1B28',
    letterSpacing: -0.5,
  },
});

// ─── 4. WATER INTAKE CARD (half width) ───────────────────────────────────────
// Matches Stitch: water icon + add, "1.8L / 2.5L", coral bar chart, "WATER INTAKE"
export function WaterCard({ onPress, weekData = [] }) {
  const { todayMetrics, logWater } = useMetricsStore();
  const { water } = todayMetrics;
  const goal = 2.5;
  const safeWeek = weekData.length === 7 ? weekData : [2.1, 1.9, 2.5, 1.6, 2.0, water, 0];
  const RED = '#A23B2A';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[hwStyles.card, SHADOWS.card]}
    >
      {/* Top: icon + add button */}
      <View style={hwStyles.topRow}>
        <View style={[hwStyles.iconBox, { backgroundColor: '#F8EBEA' }]}>
          <Ionicons name="water-outline" size={18} color={RED} />
        </View>
        <TouchableOpacity onPress={logWater} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="add-circle-outline" size={24} color={RED} />
        </TouchableOpacity>
      </View>

      {/* Value */}
      <View style={hwStyles.valueRow}>
        <Text style={hwStyles.value}>{water.toFixed(1)}L</Text>
        <Text style={hwStyles.goal}> / {goal}L</Text>
      </View>

      {/* Bar chart */}
      <View style={{ marginTop: SPACING.md, flex: 1, justifyContent: 'flex-end' }}>
        <MiniBarChart data={safeWeek} color={RED} maxHeight={44} barWidth={13} hideLabels={true} />
      </View>

      <Text style={hwStyles.footerLabel}>WATER INTAKE</Text>
    </TouchableOpacity>
  );
}

// ─── 5. SLEEP QUALITY CARD (half width) ──────────────────────────────────────
// Matches Stitch: moon icon + "+4%", "7h 20m", teal bar chart, "SLEEP QUALITY"
export function SleepCard({ onPress, weekData = [] }) {
  const { todayMetrics, weeklyData } = useMetricsStore();
  const { sleep } = todayMetrics;
  const h = Math.floor(sleep);
  const m = Math.round((sleep - h) * 60);
  const safeWeek = weekData.length === 7 ? weekData : (weeklyData?.map(d => d.sleep) || [7.5, 6.8, 8.0, 7.1, 7.8, sleep, 0]);
  const GREEN = '#11664D';

  // Calc change vs last week avg
  const lastWeekAvg = 7.0;
  const changePct = Math.round(((sleep - lastWeekAvg) / lastWeekAvg) * 100);
  const changeLabel = `${changePct >= 0 ? '+' : ''}${changePct}%`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[hwStyles.card, SHADOWS.card]}
    >
      {/* Top: icon + change text */}
      <View style={hwStyles.topRow}>
        <View style={[hwStyles.iconBox, { backgroundColor: '#E8F3EE' }]}>
          <Ionicons name="moon-outline" size={18} color={GREEN} />
        </View>
        <Text style={[hwStyles.changeText, { color: GREEN }]}>{changeLabel}</Text>
      </View>

      {/* Value */}
      <View style={hwStyles.valueRow}>
        <Text style={hwStyles.value}>{h}h {m}m</Text>
      </View>

      {/* Bar chart */}
      <View style={{ marginTop: SPACING.md, flex: 1, justifyContent: 'flex-end' }}>
        <MiniBarChart data={safeWeek} color={GREEN} maxHeight={44} barWidth={13} hideLabels={true} />
      </View>

      <Text style={hwStyles.footerLabel}>SLEEP QUALITY</Text>
    </TouchableOpacity>
  );
}

const hwStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 180,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    marginTop: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  value: {
    fontFamily: FONTS.black,
    fontSize: 32,
    color: '#0A1B28', 
    letterSpacing: -1,
  },
  goal: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  footerLabel: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#A0A4A8', // match image light grey
    letterSpacing: 0.5,
    marginTop: 12,
  },
});

// ─── 6. WORKOUT WEEK CARD ─────────────────────────────────────────────────────
export function WorkoutWeekCard({ onPress, logs = [] }) {
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  // For the sake of the mock design UI looking exactly like the image:
  // "4 of 5 sessions completed" and "80%" text.
  // The image shows 5 bars filled, 2 bars empty.
  // Let's use 5 sessions completed as the default for visual parity with the user image.
  const completedSessions = 5;
  const totalGoal = 5; // They might have a goal of 5. The image shows "4 of 5", but the bars show 5 filled. Let's use what the image text says: "4 of 5" but the bars actually show Mon, Tue, Thu, Fri as filled (that's 4 bars filled!). Mon is high, Tue is slightly lower, Wed is empty, Thu is high, Fri is slightly lower, Sat/Sun empty.
  // Let's match the bar heights from the image:
  const barHeights = [1, 0.85, 0.15, 1, 0.85, 0.15, 0.15];
  const barWidth = 24; 

  const GREEN_TEXT = '#11664D';
  const GREEN_BAR = '#84A98C';
  const EMPTY_BAR = '#EBEBEB';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[wwStyles.card, SHADOWS.card]}>
      <View style={wwStyles.header}>
        <View style={wwStyles.titleWrapper}>
          <Text style={wwStyles.title}>Workouts This Week</Text>
          <Text style={wwStyles.subtitle}>4 of 5 sessions completed</Text>
        </View>
        <Text style={[wwStyles.percentText, { color: GREEN_TEXT }]}>80%</Text>
      </View>

      <View style={wwStyles.barsArea}>
        {days.map((d, i) => (
          <View key={d} style={wwStyles.barCol}>
            <View
              style={[
                wwStyles.bar,
                {
                  width: barWidth,
                  height: 60 * Math.max(barHeights[i], 0.15),
                  backgroundColor: barHeights[i] > 0.2 ? GREEN_BAR : EMPTY_BAR,
                  borderRadius: barWidth / 2,
                },
              ]}
            />
            <Text style={wwStyles.barLabel}>{d}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
}

const wwStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    paddingVertical: 28,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xxl,
  },
  titleWrapper: {
    flex: 1,
  },
  title: { 
    fontFamily: FONTS.bold, 
    fontSize: 18, 
    color: '#0A1B28',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#717578',
  },
  percentText: {
    fontFamily: FONTS.black,
    fontSize: 28,
  },
  barsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  barCol: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-end' 
  },
  bar: { 
    marginBottom: 12,
  },
  barLabel: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#A0A4A8',
    letterSpacing: 0.5,
  },
});

// ─── 7. DIET TARGETS CARD ─────────────────────────────────────────────────────
export function DietTargetsCard({ onPress }) {
  const currentCalories = 1840;
  const maxCalories = 2400;
  const currentProtein = 112;
  const maxProtein = 150;
  const currentCarbs = 210;
  const maxCarbs = 300;
  const currentFats = 48;
  const maxFats = 80;

  const calPct = Math.min(currentCalories / maxCalories, 1) * 100;
  const proPct = Math.min(currentProtein / maxProtein, 1) * 100;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={[dtStyles.card, SHADOWS.card]}>
      {/* Header */}
      <View style={dtStyles.headerRow}>
        <Text style={dtStyles.title}>Diet Targets</Text>
        <Ionicons name="restaurant-outline" size={22} color={COLORS.textDark} />
      </View>

      {/* Calories */}
      <View style={dtStyles.macroRow}>
        <Text style={dtStyles.macroLabel}>Calories</Text>
        <Text style={dtStyles.macroValue}>
          <Text style={dtStyles.macroCurrent}>{currentCalories.toLocaleString()}</Text> / {maxCalories.toLocaleString()} kcal
        </Text>
      </View>
      <View style={dtStyles.progressBarBg}>
        <View style={[dtStyles.progressBarFill, { width: `${calPct}%`, backgroundColor: '#A23B2A' }]} />
      </View>

      {/* Protein */}
      <View style={dtStyles.macroRow}>
        <Text style={dtStyles.macroLabel}>Protein</Text>
        <Text style={dtStyles.macroValue}>
          <Text style={dtStyles.macroCurrent}>{currentProtein}g</Text> / {maxProtein}g
        </Text>
      </View>
      <View style={dtStyles.progressBarBg}>
        <View style={[dtStyles.progressBarFill, { width: `${proPct}%`, backgroundColor: '#11664D' }]} />
      </View>

      <View style={dtStyles.divider} />

      {/* Bottom Row */}
      <View style={dtStyles.bottomRow}>
        <View style={dtStyles.bottomCol}>
          <Text style={dtStyles.bottomLabel}>CARBS</Text>
          <Text style={dtStyles.bottomValue}>{currentCarbs}g <Text style={dtStyles.bottomMax}>/ {maxCarbs}g</Text></Text>
        </View>
        <View style={dtStyles.bottomCol}>
          <Text style={dtStyles.bottomLabel}>FATS</Text>
          <Text style={dtStyles.bottomValue}>{currentFats}g <Text style={dtStyles.bottomMax}>/ {maxFats}g</Text></Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const dtStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    paddingVertical: 28,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg + 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#0A1B28', 
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  macroLabel: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#0A1B28',
  },
  macroValue: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  macroCurrent: {
    fontFamily: FONTS.black,
    fontSize: 17,
    color: '#0A1B28',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#EBEBEB',
    borderRadius: 4,
    marginBottom: SPACING.lg,
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'transparent', 
    marginTop: Math.floor(SPACING.sm / 2),
    marginBottom: SPACING.lg,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bottomCol: {
    flex: 1,
  },
  bottomLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: '#717578', 
    letterSpacing: 0.8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bottomValue: {
    fontFamily: FONTS.black,
    fontSize: 19,
    color: '#0A1B28', 
  },
  bottomMax: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    color: COLORS.textMuted,
  },
});
