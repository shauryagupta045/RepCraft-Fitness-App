/**
 * RoutineBuilderScreen + ExerciseLibraryScreen — Stitch-accurate (Image 2)
 * Library: "KNOWLEDGE BASE" header, search, category pills, featured card, exercise list
 * Builder: inline editable routine with day picker, exercise list, add button
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, useWindowDimensions, Platform, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWorkoutStore } from '../../store/workoutStore';
import { useAuthStore } from '../../store/authStore';
import { EXERCISES, EXERCISE_CATEGORIES } from '../../constants/exercises';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

function Header({ onBack, title, rightEl }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.headerBtn}>
        <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={s.headerLogo}>RepCraft</Text>
      {rightEl || <View style={s.headerBtn} />}
    </View>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   EXERCISE LIBRARY SCREEN (Image 2 - exact match)
════════════════════════════════════════════════════════════════════════════════ */
export function ExerciseLibraryScreen({ route, navigation }) {
  const { addExercise, fromBuilder } = route.params || {};
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedEx, setSelectedEx] = useState(null);
  // SetConfig state
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(0);
  const [rest, setRest] = useState(60);

  const filtered = EXERCISES.filter(ex => {
    const matchCat = category === 'All' || ex.muscle === category;
    const matchQ = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchQ;
  });

  // Featured = first result or Bench Press
  const featured = EXERCISES.find(e => e.name === 'Bench Press') || EXERCISES[0];

  const handleAdd = () => {
    if (!selectedEx) return;
    if (addExercise) addExercise({ ...selectedEx, sets, reps, weight, rest });
    navigation.goBack();
  };

  /* ── Set Config Panel ── */
  if (selectedEx) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <Header
          onBack={() => setSelectedEx(null)}
          rightEl={
            <TouchableOpacity onPress={handleAdd} style={s.headerBtn}>
              <Text style={{ fontFamily: FONTS.bold, fontSize: 14, color: COLORS.primary }}>Add</Text>
            </TouchableOpacity>
          }
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          {/* Category + name */}
          <View style={cfg.pillRow}>
            <View style={cfg.pill}><Text style={cfg.pillText}>{selectedEx.muscle?.toUpperCase()}</Text></View>
          </View>
          <Text style={cfg.exName}>{selectedEx.name}</Text>
          <Text style={cfg.exDesc}>{selectedEx.type} · {selectedEx.equipment}</Text>

          {/* Sets stepper */}
          <Text style={cfg.fieldLabel}>SETS</Text>
          <View style={cfg.stepper}>
            <TouchableOpacity onPress={() => setSets(p => Math.max(1, p - 1))} style={cfg.stepBtn}>
              <Ionicons name="remove" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={cfg.stepVal}>{sets}</Text>
            <TouchableOpacity onPress={() => setSets(p => p + 1)} style={cfg.stepBtn}>
              <Ionicons name="add" size={22} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Reps + Weight */}
          <View style={cfg.inputRow}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Text style={cfg.fieldLabel}>REPS</Text>
              <View style={cfg.field}>
                <TextInput
                  style={cfg.fieldInput}
                  value={String(reps)}
                  onChangeText={v => setReps(parseInt(v) || 0)}
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={cfg.fieldLabel}>WEIGHT (kg)</Text>
              <View style={cfg.field}>
                <TextInput
                  style={cfg.fieldInput}
                  value={String(weight)}
                  onChangeText={v => setWeight(parseFloat(v) || 0)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Rest */}
          <Text style={cfg.fieldLabel}>REST TIME</Text>
          <View style={cfg.restRow}>
            {[30, 60, 90, 120].map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => setRest(r)}
                style={[cfg.restBtn, rest === r && cfg.restBtnActive]}
              >
                <Text style={[cfg.restBtnText, rest === r && { color: '#fff' }]}>{r}s</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add CTA */}
          <TouchableOpacity onPress={handleAdd} style={cfg.cta}>
            <LinearGradient colors={[COLORS.primary, '#D45A48']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={cfg.ctaGrad}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={cfg.ctaText}>Add to Routine</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── Library list ── */
  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Header
        onBack={() => navigation.goBack()}
        rightEl={
          <TouchableOpacity style={s.headerBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Knowledge base label */}
        <Text style={lib.kbLabel}>KNOWLEDGE BASE</Text>
        <Text style={lib.pageTitle}>Exercise Library</Text>

        {/* Search */}
        <View style={[lib.searchBox, SHADOWS.sm]}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={lib.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises..."
            placeholderTextColor={COLORS.textMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
          {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'].map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[lib.catPill, category === cat && lib.catPillActive]}
            >
              <Text style={[lib.catText, category === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured exercise card */}
        {category === 'All' && search === '' && (
          <View style={[lib.featuredCard, SHADOWS.md]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('ExerciseDetail', { exercise: featured })}
              activeOpacity={0.9}
            >
              {/* Grey placeholder image area */}
              <View style={lib.featuredImg}>
                <View style={lib.featuredImgInner}>
                  <Ionicons name="barbell" size={60} color="rgba(255,255,255,0.6)" />
                </View>
              </View>
              <View style={lib.featuredBody}>
                <View style={lib.featuredTagRow}>
                  <View style={lib.featuredTag}>
                    <Text style={lib.featuredTagText}>FEATURED EXERCISE</Text>
                  </View>
                  {fromBuilder ? (
                    <TouchableOpacity
                      style={lib.addBtn}
                      onPress={() => {
                        addExercise(featured);
                        navigation.goBack();
                      }}
                    >
                      <Ionicons name="add" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons name="star" size={16} color={COLORS.primary} />
                  )}
                </View>
                <Text style={lib.featuredName}>{featured.name}</Text>
                <View style={lib.featuredMeta}>
                  <Ionicons name="body-outline" size={14} color={COLORS.secondary} />
                  <Text style={lib.featuredMetaText}>{featured.muscle}</Text>
                  <View style={lib.featuredMetaDot} />
                  <Ionicons name="barbell-outline" size={14} color={COLORS.textMuted} />
                  <Text style={lib.featuredMetaText}>{featured.equipment} · {featured.type}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Exercise list */}
        {filtered.map(ex => (
          <View
            key={ex.id}
            style={[lib.exRow, SHADOWS.sm]}
          >
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('ExerciseDetail', { exercise: ex })}
              activeOpacity={0.7}
            >
              <View style={[lib.exIcon, { backgroundColor: COLORS.border }]}>
                <Ionicons name="body-outline" size={22} color={COLORS.textMuted} />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={lib.exName}>{ex.name}</Text>
                <Text style={lib.exMeta}>{ex.muscle} · {ex.equipment}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={lib.addBtn}
              onPress={() => {
                if (fromBuilder) {
                  addExercise(ex);
                  navigation.goBack();
                } else {
                  navigation.navigate('ExerciseDetail', { exercise: ex });
                }
              }}
            >
              <Ionicons name={fromBuilder ? 'add' : 'chevron-forward'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={lib.empty}>
            <Ionicons name="search-outline" size={40} color={COLORS.textMuted} />
            <Text style={lib.emptyText}>No exercises found</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ════════════════════════════════════════════════════════════════════════════════
   ROUTINE BUILDER SCREEN
════════════════════════════════════════════════════════════════════════════════ */
export function RoutineBuilderScreen({ route, navigation }) {
  const { routineId } = route.params || {};
  const { routines, addRoutine, updateRoutine } = useWorkoutStore();
  const existing = routines.find(r => r.id === routineId);

  const [title, setTitle] = useState(existing?.title || 'Chest Day');
  const [day, setDay] = useState(existing?.day || 'Monday');
  const [muscleGroup, setMuscleGroup] = useState(existing?.muscleGroup || 'Full Body');
  const [exercises, setExercises] = useState(existing?.exercises || []);
  const [saved, setSaved] = useState(false);
  const [menuEx, setMenuEx] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);

  const remove = (id) => {
    setExercises(p => p.filter(e => e.id !== id));
    setMenuEx(null);
  };

  const handleMenu = (ex) => {
    setMenuEx(ex);
  };

  const moveUp = (index) => {
    if (index === 0) return;
    setExercises(p => {
      const copy = [...p];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const moveDown = (index) => {
    if (index === exercises.length - 1) return;
    setExercises(p => {
      const copy = [...p];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      ...ex,
      id: `ex_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      sets: ex.sets || 3, reps: ex.reps || 10,
      weight: ex.weight || 0, rest: ex.rest || 60, pr: null,
    }]);
  };

  const { incrementStreak } = useAuthStore();

  const save = () => {
    const data = { title, day, muscleGroup, exercises };
    if (existing) updateRoutine(routineId, data);
    else {
      addRoutine(data);
      incrementStreak(); // Increment streak for adding a new routine
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); navigation.goBack(); }, 900);
  };

  const discard = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Custom Header */}
      <View style={rb.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={rb.headerIconBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={rb.headerTitle}>{reorderMode ? 'Reorder Exercises' : 'Edit Routine'}</Text>
        <View style={rb.headerRight}>
          {reorderMode ? (
            <TouchableOpacity onPress={() => setReorderMode(false)} style={rb.saveBtn}>
              <Text style={rb.saveBtnText}>Done</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={discard} style={{ marginRight: 16 }}>
                <Text style={rb.discardText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={rb.saveBtn}>
                <Text style={rb.saveBtnText}>{saved ? 'Saved' : 'Save'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={rb.scroll}>

        {/* Title Area */}
        <Text style={rb.dayText}>{day.toUpperCase()}</Text>
        <TextInput
          style={rb.largeTitle}
          value={title}
          onChangeText={setTitle}
          placeholder="Routine name"
          placeholderTextColor={COLORS.textMuted}
        />

        {/* Pills */}
        <View style={rb.pillRow}>
          <View style={rb.pill}>
            <Ionicons name="calendar-outline" size={14} color="#8A92A6" />
            <Text style={rb.pillText}>WEEKLY SPLIT</Text>
          </View>
          <View style={rb.pill}>
            <Ionicons name="stopwatch-outline" size={14} color="#8A92A6" />
            <Text style={rb.pillText}>EST. {exercises.length * 10} MIN</Text>
          </View>
        </View>

        {/* Exercises */}
        {exercises.map((ex, i) => (
          <View key={ex.id} style={rb.exCard}>
            {/* Drag Handle Icon Placeholder */}
            <View style={rb.dragHandle}>
              <Ionicons name="grid" size={14} color="#E2E8F0" />
            </View>

            <View style={rb.exContent}>
              <View style={rb.exHeaderRow}>
                <Text style={rb.exName}>{ex.name}</Text>
                <Text style={rb.exTag}>{ex.type?.toUpperCase() || (i === 0 ? 'COMP LIFT' : 'VOLUME')}</Text>
              </View>

              <Text style={rb.exMeta}>{ex.sets} sets • {ex.rest}s rest</Text>

              <View style={rb.exRecordRow}>
                <Text style={rb.exRecordBold}>PR: {ex.pr || 0}kg</Text>
                <Text style={rb.exRecordLight}> • Last: {ex.weight || 0}kg x {ex.reps || 0}</Text>
              </View>
            </View>

            {/* Menu Icon or Reorder Controls */}
            {reorderMode ? (
              <View style={rb.reorderControls}>
                <TouchableOpacity onPress={() => moveUp(i)} style={rb.reorderBtn}>
                  <Ionicons name="chevron-up" size={24} color={i === 0 ? COLORS.border : COLORS.textDark} />
                </TouchableOpacity>
                <View style={{height: 8}} />
                <TouchableOpacity onPress={() => moveDown(i)} style={rb.reorderBtn}>
                  <Ionicons name="chevron-down" size={24} color={i === exercises.length - 1 ? COLORS.border : COLORS.textDark} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => handleMenu(ex)} style={rb.exMenuBtn}>
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Add Exercise */}
        <TouchableOpacity
          style={rb.addBtnBox}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ExerciseLibrary', { fromBuilder: true, addExercise })}
        >
          <View style={rb.addIconCircle}>
            <Ionicons name="add" size={20} color="#F57D71" />
          </View>
          <Text style={rb.addBtnTextCentered}>Add Exercise</Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={rb.statsRow}>
          <View style={rb.statBox}>
            <Text style={rb.statLabel}>VOLUME LOAD</Text>
            <Text style={rb.statValue}>
              {exercises.reduce((sum, ex) => sum + (ex.sets * ex.reps * (ex.weight || 0)), 0).toLocaleString()} 
              <Text style={rb.statUnit}> kg</Text>
            </Text>
          </View>
          <View style={rb.statBox}>
            <Text style={rb.statLabel}>FOCUS SCORE</Text>
            <Text style={rb.statValue}>
              {exercises.length > 0 ? 85 : 0} 
              <Text style={rb.statUnit}> %</Text>
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Action Menu Modal */}
      <Modal transparent visible={!!menuEx} animationType="fade" onRequestClose={() => setMenuEx(null)}>
        <TouchableOpacity style={rb.modalOverlay} activeOpacity={1} onPress={() => setMenuEx(null)}>
          <View style={rb.modalContent}>
            <Text style={rb.modalTitle}>{menuEx?.name}</Text>
            
            <TouchableOpacity 
              style={rb.modalActionBtn} 
              onPress={() => {
                const ex = menuEx;
                setMenuEx(null);
                navigation.navigate('ExerciseDetail', { exercise: ex });
              }}
            >
              <Ionicons name="create-outline" size={20} color={COLORS.textDark} />
              <Text style={rb.modalActionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={rb.modalActionBtn} 
              onPress={() => {
                setMenuEx(null);
                navigation.navigate('ExerciseLibrary', { fromBuilder: true, addExercise });
              }}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color={COLORS.textDark} />
              <Text style={rb.modalActionText}>Replace Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={rb.modalActionBtn} 
              onPress={() => {
                setMenuEx(null);
                setReorderMode(true);
              }}
            >
              <Ionicons name="swap-vertical-outline" size={20} color={COLORS.textDark} />
              <Text style={rb.modalActionText}>Reorder Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[rb.modalActionBtn, rb.modalActionBtnLast]} 
              onPress={() => {
                remove(menuEx?.id);
                setMenuEx(null);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#F05252" />
              <Text style={[rb.modalActionText, { color: '#F05252' }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity style={rb.modalCancelBtn} onPress={() => setMenuEx(null)}>
              <Text style={rb.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

/* ─── Shared styles ────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: '#FAFAFA' },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerLogo: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  scroll: { padding: SPACING.lg },
});

/* ─── Library styles ───────────────────────────────────────────────────────── */
const lib = StyleSheet.create({
  kbLabel: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  pageTitle: { fontFamily: FONTS.black, fontSize: 28, color: COLORS.textDark, letterSpacing: -0.5, marginBottom: SPACING.lg },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  searchInput: { flex: 1, fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textDark, paddingVertical: 13, marginLeft: SPACING.sm },
  catPill: { backgroundColor: COLORS.surface, borderRadius: RADIUS.pill, paddingHorizontal: 16, paddingVertical: 9, marginRight: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border },
  catPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMid },
  featuredCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, overflow: 'hidden', marginBottom: SPACING.lg },
  featuredImg: { height: 180, backgroundColor: '#2C3E50', justifyContent: 'center', alignItems: 'center' },
  featuredImgInner: { opacity: 0.5 },
  featuredBody: { padding: SPACING.lg },
  featuredTagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  featuredTag: { backgroundColor: COLORS.secondary + '20', borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 4 },
  featuredTagText: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.secondary, letterSpacing: 0.8 },
  featuredName: { fontFamily: FONTS.black, fontSize: 22, color: COLORS.textDark, marginBottom: 8 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center' },
  featuredMetaText: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginHorizontal: 4 },
  featuredMetaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.textMuted },
  exRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.md, marginBottom: SPACING.sm },
  exIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exName: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  exMeta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.border },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textMuted, marginTop: 12 },
});

/* ─── Set Config styles ──────────────────────────────────────────────────────── */
const cfg = StyleSheet.create({
  pillRow: { marginBottom: 8 },
  pill: { backgroundColor: COLORS.secondary + '20', borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  pillText: { fontFamily: FONTS.bold, fontSize: 11, color: COLORS.secondary, letterSpacing: 0.8 },
  exName: { fontFamily: FONTS.black, fontSize: 24, color: COLORS.textDark, marginBottom: 4 },
  exDesc: { fontFamily: FONTS.regular, fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl },
  fieldLabel: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: SPACING.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  stepBtn: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  stepVal: { fontFamily: FONTS.black, fontSize: 48, color: COLORS.textDark, marginHorizontal: SPACING.xl },
  inputRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  field: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: SPACING.md, ...SHADOWS.sm },
  fieldInput: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark, paddingVertical: 12, textAlign: 'center' },
  restRow: { flexDirection: 'row', marginBottom: SPACING.xl },
  restBtn: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.pill, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8 },
  restBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  restBtnText: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textMuted },
  cta: { borderRadius: RADIUS.md, overflow: 'hidden' },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  ctaText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff', marginLeft: 8 },
});

/* ─── Routine Builder styles ─────────────────────────────────────────────────── */
const rb = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerIconBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  discardText: { fontFamily: FONTS.bold, fontSize: 14, color: '#F05252' },
  saveBtn: { backgroundColor: '#F57D71', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  dayText: { fontFamily: FONTS.bold, fontSize: 12, color: '#D96055', letterSpacing: 1.5, marginBottom: 4 },
  largeTitle: { fontFamily: FONTS.black, fontSize: 36, color: COLORS.textDark, letterSpacing: -1, marginBottom: 20, padding: 0 },

  pillRow: { flexDirection: 'row', marginBottom: 30 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 10 },
  pillText: { fontFamily: FONTS.bold, fontSize: 10, color: '#8A92A6', marginLeft: 6, letterSpacing: 0.5 },

  exCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 16, ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.03)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 } }) },
  dragHandle: { width: 24, paddingRight: 8, justifyContent: 'center', alignItems: 'center' },
  exContent: { flex: 1, marginLeft: 4 },
  exHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 },
  exName: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  exTag: { fontFamily: FONTS.bold, fontSize: 10, color: '#A0AEC0', letterSpacing: 0.5 },
  exMeta: { fontFamily: FONTS.medium, fontSize: 13, color: '#718096', marginBottom: 6 },
  exRecordRow: { flexDirection: 'row', alignItems: 'center' },
  exRecordBold: { fontFamily: FONTS.bold, fontSize: 13, color: COLORS.textDark },
  exRecordLight: { fontFamily: FONTS.medium, fontSize: 13, color: '#A0AEC0' },
  exMenuBtn: { padding: 4, width: 30, alignItems: 'flex-end' },

  addBtnBox: { borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#F57D71', borderRadius: 20, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  addIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0EE', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  addBtnTextCentered: { fontFamily: FONTS.bold, fontSize: 14, color: '#F57D71' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { width: '48%', backgroundColor: '#F7F9FC', borderRadius: 20, padding: 16 },
  statLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#A0AEC0', letterSpacing: 0.5, marginBottom: 16 },
  statValue: { fontFamily: FONTS.black, fontSize: 24, color: COLORS.textDark, letterSpacing: -0.5 },
  statUnit: { fontFamily: FONTS.bold, fontSize: 14, color: '#A0AEC0' },

  reorderControls: { padding: 4, width: 34, alignItems: 'center', justifyContent: 'center' },
  reorderBtn: { padding: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark, marginBottom: 16, textAlign: 'center' },
  modalActionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalActionBtnLast: { borderBottomWidth: 0, marginBottom: 10 },
  modalActionText: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textDark, marginLeft: 12 },
  modalCancelBtn: { backgroundColor: '#F4F5F7', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalCancelText: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
});

