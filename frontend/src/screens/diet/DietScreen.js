/**
 * DietScreen — Redesigned to match reference image
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useDietStore } from '../../store/dietStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

/* ─── Circular Progress Ring ─────────────────────────────────────────────────── */
function Ring({ size = 80, stroke = 8, pct = 0, color, backgroundColor = '#F0F0F0' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 1) * circ);
  const cx = size / 2;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cx} r={r} stroke={backgroundColor} strokeWidth={stroke} fill="none" />
      <Circle
        cx={cx} cy={cx} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={`${circ} ${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90" origin={`${cx},${cx}`}
      />
    </Svg>
  );
}

/* ─── Macro Card ─────────────────────────────────────────────────────────────── */
function MacroCard({ label, current, target, color, unit = 'g' }) {
  const pct = Math.min(current / target, 1);
  return (
    <View style={mS.card}>
      <View style={mS.ringWrap}>
        <Ring size={50} stroke={5} pct={pct} color={color} />
      </View>
      <Text style={mS.value}>{current}/{target}{unit}</Text>
      <Text style={mS.label}>{label}</Text>
    </View>
  );
}

const mS = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: '#F8F9FA', borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', marginHorizontal: 4,
  },
  ringWrap: { marginBottom: 8 },
  value: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textDark },
  label: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase' },
});

/* ─── Supplement Row ─────────────────────────────────────────────────────────── */
function SuppRow({ supp, onToggle }) {
  const initial = supp.name.charAt(0);
  const iconColor = supp.name.toLowerCase().includes('whey') ? '#A0F3E3' : '#C5F3D1';

  return (
    <View style={suppS.row}>
      <View style={[suppS.icon, { backgroundColor: iconColor }]}>
        <Text style={suppS.iconText}>{initial}</Text>
      </View>
      <View style={{ flex: 1, marginLeft: SPACING.md }}>
        <Text style={suppS.name}>{supp.name}</Text>
        <Text style={suppS.meta}>{supp.dose} • {supp.time}</Text>
      </View>
      <Switch
        value={supp.taken}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const suppS = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },
  name: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  meta: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});

/* ─── Meal Log Row ───────────────────────────────────────────────────────────── */
function MealRow({ meal }) {
  return (
    <TouchableOpacity style={mealS.row} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={mealS.name}>{meal.name}</Text>
        <Text style={mealS.meta}>{meal.weight} • {meal.calories} Kcal • {meal.protein}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

const mealS = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  name: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  meta: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});

/* ─── Main DietScreen ────────────────────────────────────────────────────────── */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { loadFoodLog, loadUserProfile, getDateKey, loadSupplements, toggleSupplement } from '../../store/nutritionStore';

export default function DietScreen() {
  const navigation = useNavigation();
  const [log, setLog] = useState({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, meals: [] });
  const [targets, setTargets] = useState({ calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 });
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        const [p, l, sData] = await Promise.all([
          loadUserProfile(), 
          loadFoodLog(getDateKey()),
          loadSupplements()
        ]);
        setTargets(p.targets || targets);
        setLog(l);
        setSupplements(sData);
        setLoading(false);
      };
      load();
    }, [])
  );

  const handleToggleSupp = async (id) => {
    const updated = await toggleSupplement(id);
    if (updated) setSupplements(updated);
  };

  const kcalLeft = targets.calories - log.totalCalories;
  const calPct = Math.min(log.totalCalories / targets.calories, 1);
  const remainingSupps = supplements.filter(s => !s.taken).length;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.subHeader}>NUTRITION OVERVIEW</Text>
            <View style={s.titleRow}>
              <Text style={s.title}>Diet</Text>
              <TouchableOpacity onPress={() => navigation.navigate('UpdateTargets')}>
                <MaterialCommunityIcons name="pencil-outline" size={22} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Main Calorie Card ── */}
        <View style={s.calCard}>
          <View style={s.calRingWrap}>
            <Ring size={180} stroke={16} pct={calPct} color={COLORS.primary} backgroundColor="#F0F0F0" />
            <View style={s.calCenterText}>
              <Text style={s.kcalNum}>{kcalLeft.toLocaleString()}</Text>
              <Text style={s.kcalLabel}>KCAL LEFT</Text>
            </View>
          </View>
        </View>

        {/* ── Macro Rows ── */}
        <View style={s.macroRow}>
          <MacroCard label="Protein" current={log.totalProtein} target={targets.protein} color="#14726B" />
          <MacroCard label="Carbs" current={log.totalCarbs} target={targets.carbs} color="#4A6563" />
          <MacroCard label="Fiber" current={log.totalFiber} target={targets.fiber} color="#A84C42" />
        </View>

        {/* ── Action Buttons ── */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('LogFood', { mealType: 'Lunch' })}>
            <Ionicons name="add" size={20} color={COLORS.primary} />
            <Text style={s.actionBtnText}>LOG FOOD</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[s.actionBtn, { backgroundColor: '#FDE2E0', borderColor: 'transparent' }]}
            onPress={() => navigation.navigate('Scanner')}
          >
            <MaterialCommunityIcons name="barcode-scan" size={18} color="#A84C42" />
            <Text style={[s.actionBtnText, { color: '#A84C42', marginLeft: 8 }]}>SCAN PACKET</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.updateBtn} onPress={() => navigation.navigate('UpdateTargets')}>
          <Ionicons name="reload" size={16} color={COLORS.textMuted} />
          <Text style={s.updateBtnText}>UPDATE TARGETS</Text>
        </TouchableOpacity>

        {/* ── Supplements ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today's Supplements</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{remainingSupps} REMAINING</Text>
          </View>
        </View>
        {supplements.slice(0, 3).map(supp => (
          <SuppRow key={supp.id} supp={supp} onToggle={() => handleToggleSupp(supp.id)} />
        ))}

        {/* ── Meal Log ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Today's Meal Log</Text>
          <TouchableOpacity onPress={() => navigation.navigate('FoodDiary')}>
            <Text style={s.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {log.meals.slice(0, 3).map(meal => (
          <MealRow key={meal.id} meal={{ name: meal.foodName, weight: `${meal.grams}g`, calories: meal.calories, protein: `${meal.protein}g P` }} />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: SPACING.lg },
  header: { marginBottom: SPACING.lg },
  subHeader: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  title: { fontFamily: FONTS.black, fontSize: 32, color: COLORS.textDark },

  calCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.lg, ...SHADOWS.md,
  },
  calRingWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  calCenterText: { position: 'absolute', alignItems: 'center' },
  kcalNum: { fontFamily: FONTS.black, fontSize: 36, color: COLORS.textDark },
  kcalLabel: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted, marginTop: -4 },

  macroRow: { flexDirection: 'row', marginBottom: SPACING.lg },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0',
    borderRadius: RADIUS.md, paddingVertical: 14, marginHorizontal: 4,
  },
  actionBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textDark, marginLeft: 4 },

  updateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F4F6', borderRadius: RADIUS.md, paddingVertical: 12,
    marginBottom: SPACING.xl,
  },
  updateBtnText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted, marginLeft: 8, textTransform: 'uppercase' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },
  badge: { backgroundColor: '#FDE2E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  badgeText: { fontFamily: FONTS.bold, fontSize: 10, color: '#A84C42', textTransform: 'uppercase' },
  seeAll: { fontFamily: FONTS.bold, fontSize: 13, color: '#A84C42' },
});
