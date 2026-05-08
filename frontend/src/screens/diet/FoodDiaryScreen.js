/**
 * FoodDiaryScreen — Screen 4
 * Date selector, daily macro summary, collapsible meal sections, water tracker.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  loadFoodLog, loadUserProfile, deleteFoodEntry, updateWater, getDateKey,
} from '../../store/nutritionStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
const MEAL_ICONS = ['sunny', 'partly-sunny', 'moon', 'cafe'];

// Build last 7 days + today as date strings
const buildDates = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dayStr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    days.push({ date: `${y}-${m}-${day}`, dayStr, dayNum: d.getDate() });
  }
  return days;
};

const ProgressBar = ({ pct, color }) => (
  <View style={pb.track}>
    <View style={[pb.fill, { width: `${Math.min(Math.round(pct * 100), 100)}%`, backgroundColor: color }]} />
  </View>
);
const pb = StyleSheet.create({
  track: { height: 4, backgroundColor: '#F0F0F0', borderRadius: 2, marginTop: 4 },
  fill: { height: 4, borderRadius: 2 },
});

function MealSection({ type, icon, meals, onDelete, onAddFood, dateStr }) {
  const [expanded, setExpanded] = useState(true);
  const totalCal = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <View style={ms.section}>
      <TouchableOpacity style={ms.header} onPress={() => setExpanded((e) => !e)}>
        <View style={ms.headerLeft}>
          <View style={ms.iconCircle}>
            <Ionicons name={icon} size={18} color={COLORS.primary} />
          </View>
          <Text style={ms.typeLabel}>{type}</Text>
        </View>
        <View style={ms.headerRight}>
          <Text style={ms.totalCal}>{Math.round(totalCal)} kcal</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <>
          {meals.length === 0 ? (
            <Text style={ms.emptyText}>No foods logged</Text>
          ) : (
            meals.map((meal) => (
              <View key={meal.id} style={ms.foodRow}>
                <View style={{ flex: 1 }}>
                  <Text style={ms.foodName}>{meal.foodName}</Text>
                  <Text style={ms.foodMeta}>{meal.grams}g • {Math.round(meal.calories)} kcal</Text>
                  <View style={ms.macroTags}>
                    <View style={ms.tag}><Text style={ms.tagText}>P {Math.round(meal.protein)}g</Text></View>
                    <View style={ms.tag}><Text style={ms.tagText}>C {Math.round(meal.carbs)}g</Text></View>
                    <View style={ms.tag}><Text style={ms.tagText}>F {Math.round(meal.fat)}g</Text></View>
                  </View>
                </View>
                <TouchableOpacity
                  style={ms.deleteBtn}
                  onPress={() => onDelete(meal.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            ))
          )}
          <TouchableOpacity style={ms.addRow} onPress={() => onAddFood(type)}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.primary} />
            <Text style={ms.addRowText}>Add food to {type}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const ms = StyleSheet.create({
  section: {
    backgroundColor: '#fff', borderRadius: RADIUS.card,
    marginBottom: SPACING.md, ...SHADOWS.sm, overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  typeLabel: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalCal: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted },
  emptyText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  foodRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
  },
  foodName: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  foodMeta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  macroTags: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tag: { backgroundColor: '#F3F4F6', borderRadius: RADIUS.xs, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMid },
  deleteBtn: { padding: 8, marginLeft: 8 },
  addRow: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    padding: SPACING.md, gap: 8,
  },
  addRowText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.primary },
});

export default function FoodDiaryScreen() {
  const navigation = useNavigation();
  const dates = buildDates();
  const todayDate = dates[dates.length - 1].date;
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [log, setLog] = useState({ totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, waterGlasses: 0, meals: [] });
  const [targets, setTargets] = useState({ calories: 2000, protein: 150, carbs: 250, fat: 65 });

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [p, l] = await Promise.all([loadUserProfile(), loadFoodLog(getDateKey(selectedDate))]);
        setTargets(p.targets || { calories: 2000, protein: 150, carbs: 250, fat: 65 });
        setLog(l);
      };
      load();
    }, [selectedDate])
  );

  const handleDelete = async (id) => {
    const updated = await deleteFoodEntry(getDateKey(selectedDate), id);
    setLog(updated);
  };

  const handleWater = async (delta) => {
    const updated = await updateWater(getDateKey(selectedDate), (log.waterGlasses || 0) + delta);
    setLog(updated);
  };

  const getMealsFor = (type) => (log.meals || []).filter((m) => m.mealType === type);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Food Diary</Text>
        <TouchableOpacity style={s.backBtn}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      {/* Date Selector */}
      <View style={s.dateScrollWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dateRow}>
          {dates.map((d) => (
            <TouchableOpacity
              key={d.date}
              style={[s.dateChip, selectedDate === d.date && s.dateChipActive]}
              onPress={() => setSelectedDate(d.date)}
            >
              <Text style={[s.dateDayStr, selectedDate === d.date && s.dateTextActive]}>{d.dayStr}</Text>
              <Text style={[s.dateDayNum, selectedDate === d.date && s.dateTextActive]}>{d.dayNum}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Daily Summary Card */}
        <View style={[s.summaryCard, SHADOWS.sm]}>
          {[
            { label: 'Calories', val: Math.round(log.totalCalories), target: targets.calories, unit: 'kcal', color: COLORS.primary },
            { label: 'Protein',  val: Math.round(log.totalProtein),  target: targets.protein,  unit: 'g',    color: '#14726B' },
            { label: 'Carbs',    val: Math.round(log.totalCarbs),    target: targets.carbs,    unit: 'g',    color: '#4A6563' },
            { label: 'Fat',      val: Math.round(log.totalFat),      target: targets.fat,      unit: 'g',    color: '#A84C42' },
          ].map((item) => (
            <View key={item.label} style={s.summaryCol}>
              <Text style={s.summaryLabel}>{item.label}</Text>
              <Text style={s.summaryVal}>{item.val}<Text style={s.summaryTarget}> / {item.target}{item.unit}</Text></Text>
              <ProgressBar pct={item.target > 0 ? item.val / item.target : 0} color={item.color} />
            </View>
          ))}
        </View>

        {/* Meal Sections */}
        {MEAL_TYPES.map((type, i) => (
          <MealSection
            key={type}
            type={type}
            icon={MEAL_ICONS[i]}
            meals={getMealsFor(type)}
            onDelete={handleDelete}
            onAddFood={(mealType) => navigation.navigate('LogFood', { mealType })}
            dateStr={selectedDate}
          />
        ))}

        {/* Water Tracker */}
        <View style={[s.waterCard, SHADOWS.sm]}>
          <Text style={s.waterTitle}>Water Intake</Text>
          <View style={s.waterRow}>
            <TouchableOpacity style={s.waterBtn} onPress={() => handleWater(-1)}>
              <Ionicons name="remove" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <View style={s.dropsRow}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < (log.waterGlasses || 0) ? 'water' : 'water-outline'}
                  size={26}
                  color={i < (log.waterGlasses || 0) ? '#4A90D9' : '#D0D7E3'}
                />
              ))}
            </View>
            <TouchableOpacity style={s.waterBtn} onPress={() => handleWater(1)}>
              <Ionicons name="add" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          <Text style={s.waterLabel}>{log.waterGlasses || 0} of 8 glasses</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },

  dateScrollWrap: { backgroundColor: '#fff', paddingBottom: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dateRow: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, gap: 10 },
  dateChip: {
    alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADIUS.md, backgroundColor: '#F3F4F6', minWidth: 52,
  },
  dateChipActive: { backgroundColor: COLORS.primary },
  dateDayStr: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted },
  dateDayNum: { fontFamily: FONTS.black, fontSize: 18, color: COLORS.textDark },
  dateTextActive: { color: '#fff' },

  scroll: { padding: SPACING.lg },

  summaryCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.card,
    flexDirection: 'row', padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCol: { flex: 1, paddingHorizontal: 4 },
  summaryLabel: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, marginBottom: 2 },
  summaryVal: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  summaryTarget: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textMuted },

  waterCard: {
    backgroundColor: '#fff', borderRadius: RADIUS.card,
    padding: SPACING.lg, marginTop: SPACING.sm,
  },
  waterTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark, marginBottom: SPACING.md },
  waterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waterBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  dropsRow: { flexDirection: 'row', gap: 4, flex: 1, justifyContent: 'center' },
  waterLabel: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
});
