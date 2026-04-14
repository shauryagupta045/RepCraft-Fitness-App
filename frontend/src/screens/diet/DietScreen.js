/**
 * DietScreen — Stitch-accurate redesign
 * Macro progress rings, supplement tracker, AI diet CTA
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useDietStore } from '../../store/dietStore';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

/* ─── Mini donut ring ────────────────────────────────────────────────────────── */
function Ring({ size = 80, stroke = 8, pct = 0, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 1) * circ);
  const cx = size / 2;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cx} r={r} stroke={color + '20'} strokeWidth={stroke} fill="none" />
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

/* ─── Macro card ─────────────────────────────────────────────────────────────── */
function MacroCard({ label, current, target, color, unit = 'g' }) {
  const pct = Math.min(current / target, 1);
  return (
    <View style={[mS.card, SHADOWS.card]}>
      <View style={mS.ringWrap}>
        <Ring size={70} stroke={7} pct={pct} color={color} />
        <View style={mS.ringCenter}>
          <Text style={[mS.ringVal, { color }]}>{current}</Text>
          <Text style={mS.ringUnit}>{unit}</Text>
        </View>
      </View>
      <Text style={mS.label}>{label}</Text>
      <Text style={mS.target}>/ {target}{unit}</Text>
    </View>
  );
}

const mS = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACING.sm, alignItems: 'center', marginHorizontal: 4,
  },
  ringWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringVal: { fontFamily: FONTS.black, fontSize: 16, lineHeight: 18 },
  ringUnit: { fontFamily: FONTS.regular, fontSize: 9, color: COLORS.textMuted },
  label: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textDark },
  target: { fontFamily: FONTS.regular, fontSize: 10, color: COLORS.textMuted },
});

/* ─── Supplement row ─────────────────────────────────────────────────────────── */
function SuppRow({ supp, onToggle, onDelete }) {
  const [showDel, setShowDel] = useState(false);

  return (
    <TouchableOpacity
      onLongPress={() => setShowDel(s => !s)}
      onPress={() => { if (showDel) setShowDel(false); }}
      activeOpacity={0.85}
      style={[suppS.row, SHADOWS.card]}
    >
      <View style={[suppS.icon, { backgroundColor: supp.taken ? COLORS.secondary + '18' : COLORS.border }]}>
        <Ionicons name="medical-outline" size={18} color={supp.taken ? COLORS.secondary : COLORS.textMuted} />
      </View>
      <View style={{ flex: 1, marginLeft: SPACING.sm }}>
        <Text style={suppS.name}>{supp.name}</Text>
        <View style={suppS.metaRow}>
          <Ionicons name="time-outline" size={11} color={COLORS.textMuted} />
          <Text style={suppS.meta}>{supp.time}</Text>
          {supp.dose ? <Text style={suppS.meta}> · {supp.dose}</Text> : null}
        </View>
      </View>
      {showDel && (
        <TouchableOpacity onPress={onDelete} style={suppS.delBtn}>
          <Ionicons name="trash-outline" size={17} color={COLORS.danger} />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
        <Ionicons
          name={supp.taken ? 'checkmark-circle' : 'radio-button-off-outline'}
          size={28}
          color={supp.taken ? COLORS.secondary : COLORS.border}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const suppS = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.button,
    padding: SPACING.md, marginBottom: SPACING.sm,
  },
  icon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  meta: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginLeft: 3 },
  delBtn: { padding: 8, marginRight: 4 },
});

/* ─── Main DietScreen ────────────────────────────────────────────────────────── */
export default function DietScreen({ navigation }) {
  const { targets, supplements, updateTargets, toggleSupplement, deleteSupplement, addSupplement } = useDietStore();

  const [editMode,    setEditMode]    = useState(false);
  const [showAddSupp, setShowAddSupp] = useState(false);
  const [newCal,  setNewCal]  = useState(String(targets.calories));
  const [newProt, setNewProt] = useState(String(targets.protein));
  const [newFat,  setNewFat]  = useState(String(targets.fat));
  const [newCarb, setNewCarb] = useState(String(targets.carbs));
  const [suppName, setSuppName] = useState('');
  const [suppTime, setSuppTime] = useState('08:00');
  const [suppDose, setSuppDose] = useState('');

  const taken = supplements.filter(s => s.taken).length;
  const calPct = Math.min(targets.currentCalories / targets.calories, 1);

  const saveTargets = () => {
    updateTargets({
      calories: parseInt(newCal) || targets.calories,
      protein:  parseInt(newProt) || targets.protein,
      fat:      parseInt(newFat)  || targets.fat,
      carbs:    parseInt(newCarb) || targets.carbs,
    });
    setEditMode(false);
  };

  const addSupp = () => {
    if (!suppName.trim()) return;
    addSupplement({ name: suppName, time: suppTime, dose: suppDose });
    setSuppName(''); setSuppDose('');
    setShowAddSupp(false);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.title}>Nutrition</Text>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => setEditMode(e => !e)}
          >
            <Ionicons name={editMode ? 'close' : 'create-outline'} size={18} color={COLORS.primary} />
            <Text style={s.editBtnText}>{editMode ? 'Cancel' : 'Edit Goals'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Calories overview card ── */}
        <View style={[s.calCard, SHADOWS.md]}>
          <LinearGradient
            colors={[COLORS.primary, '#D96055']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.calBanner}
          >
            <View>
              <Text style={s.calBannerLabel}>TODAY'S CALORIES</Text>
              <Text style={s.calBannerNum}>{targets.currentCalories.toLocaleString()}</Text>
              <Text style={s.calBannerSub}>of {targets.calories.toLocaleString()} kcal goal</Text>
            </View>
            <View style={s.calCircle}>
              <Text style={s.calCirclePct}>{Math.round(calPct * 100)}%</Text>
            </View>
          </LinearGradient>
          {/* Progress track */}
          <View style={s.calTrack}>
            <View style={[s.calFill, { width: `${Math.round(calPct * 100)}%` }]} />
          </View>
        </View>

        {/* ── Macro rings ── */}
        <Text style={s.sectionTitle}>Macros</Text>
        <View style={s.macroRow}>
          <MacroCard label="Protein"  current={targets.currentProtein} target={targets.protein}  color={COLORS.primary}   unit="g" />
          <MacroCard label="Carbs"    current={targets.currentCarbs}   target={targets.carbs}    color={COLORS.secondary} unit="g" />
          <MacroCard label="Fat"      current={targets.currentFat}     target={targets.fat}      color="#6C8FC7"          unit="g" />
        </View>

        {/* ── Edit targets ── */}
        {editMode && (
          <View style={[s.editCard, SHADOWS.card]}>
            <Text style={s.editCardTitle}>Update Daily Targets</Text>
            <View style={s.editGrid}>
              {[
                { label: 'Calories', val: newCal, set: setNewCal },
                { label: 'Protein g', val: newProt, set: setNewProt },
                { label: 'Fat g', val: newFat,  set: setNewFat },
                { label: 'Carbs g', val: newCarb, set: setNewCarb },
              ].map(f => (
                <View key={f.label} style={s.editField}>
                  <Text style={s.editLabel}>{f.label}</Text>
                  <TextInput
                    style={s.editInput}
                    value={f.val}
                    onChangeText={f.set}
                    keyboardType="number-pad"
                  />
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={saveTargets} style={s.saveBtn}>
              <LinearGradient colors={[COLORS.primary, '#D96055']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGrad}>
                <Text style={s.saveText}>Save Goals</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Supplements ── */}
        <View style={s.suppHeader}>
          <View>
            <Text style={s.sectionTitle}>Supplements</Text>
            <Text style={s.suppProgress}>{taken} of {supplements.length} taken today</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddSupp(a => !a)} style={s.addSuppBtn}>
            <Ionicons name="add-circle" size={26} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Supplement progress bar */}
        <View style={s.suppTrack}>
          <View style={[s.suppFill, { width: supplements.length ? `${(taken / supplements.length) * 100}%` : '0%' }]} />
        </View>

        {supplements.map(s => (
          <SuppRow
            key={s.id}
            supp={s}
            onToggle={() => toggleSupplement(s.id)}
            onDelete={() => deleteSupplement(s.id)}
          />
        ))}

        {/* Add supplement form */}
        {showAddSupp && (
          <View style={[s.addSuppCard, SHADOWS.card]}>
            <Text style={s.addSuppTitle}>Add Supplement</Text>
            <TextInput
              style={s.addSuppInput}
              value={suppName}
              onChangeText={setSuppName}
              placeholder="Name (e.g. Creatine)"
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                style={[s.addSuppInput, { flex: 1, marginRight: SPACING.sm }]}
                value={suppTime}
                onChangeText={setSuppTime}
                placeholder="08:00"
                placeholderTextColor={COLORS.textMuted}
              />
              <TextInput
                style={[s.addSuppInput, { flex: 1 }]}
                value={suppDose}
                onChangeText={setSuppDose}
                placeholder="Dose (e.g. 5g)"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <TouchableOpacity onPress={addSupp} style={s.saveBtn}>
              <LinearGradient colors={[COLORS.secondary, '#3BBBB2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGrad}>
                <Ionicons name="add-outline" size={16} color="#fff" />
                <Text style={s.saveText}>Add Supplement</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ── AI diet CTA ── */}
        <TouchableOpacity
          style={[s.aiCta, SHADOWS.card]}
          onPress={() => navigation.navigate('AI', { screen: 'DietPlanner' })}
          activeOpacity={0.88}
        >
          <View style={s.aiCtaLeft}>
            <View style={s.aiCtaIcon}>
              <Ionicons name="nutrition-outline" size={22} color={COLORS.secondary} />
            </View>
            <View>
              <Text style={s.aiCtaTitle}>Plan Diet with AI</Text>
              <Text style={s.aiCtaSub}>Get personalised macro targets</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  title: { fontFamily: FONTS.black, fontSize: 26, color: COLORS.textDark },
  editBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primary + '14',
    borderRadius: RADIUS.pill, paddingHorizontal: 12, paddingVertical: 7,
  },
  editBtnText: { fontFamily: FONTS.medium, fontSize: 13, color: COLORS.primary, marginLeft: 5 },

  calCard: { borderRadius: RADIUS.card, overflow: 'hidden', marginBottom: SPACING.lg },
  calBanner: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: SPACING.lg,
  },
  calBannerLabel: { fontFamily: FONTS.medium, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, marginBottom: 4 },
  calBannerNum: { fontFamily: FONTS.black, fontSize: 40, color: '#fff', letterSpacing: -1 },
  calBannerSub: { fontFamily: FONTS.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  calCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  calCirclePct: { fontFamily: FONTS.black, fontSize: 20, color: '#fff' },
  calTrack: { height: 5, backgroundColor: COLORS.primary + '30' },
  calFill: { height: 5, backgroundColor: '#fff', opacity: 0.6 },

  sectionTitle: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark, marginBottom: SPACING.md },
  macroRow: { flexDirection: 'row', marginBottom: SPACING.xl },

  editCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.lg },
  editCardTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark, marginBottom: SPACING.md },
  editGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  editField: { width: '48%', marginRight: '2%', marginBottom: SPACING.sm },
  editLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginBottom: 5 },
  editInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.input,
    backgroundColor: COLORS.background, padding: 10,
    fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark, textAlign: 'center',
  },

  suppHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: SPACING.sm,
  },
  suppProgress: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  addSuppBtn: { padding: 4 },
  suppTrack: {
    height: 5, backgroundColor: COLORS.border, borderRadius: 3,
    overflow: 'hidden', marginBottom: SPACING.md,
  },
  suppFill: { height: 5, backgroundColor: COLORS.secondary, borderRadius: 3 },

  addSuppCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.card, padding: SPACING.lg, marginBottom: SPACING.lg },
  addSuppTitle: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark, marginBottom: SPACING.md },
  addSuppInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.input,
    backgroundColor: COLORS.background, padding: 12,
    fontFamily: FONTS.regular, fontSize: 15, color: COLORS.textDark, marginBottom: SPACING.sm,
  },

  saveBtn: { borderRadius: RADIUS.button, overflow: 'hidden', marginTop: SPACING.sm },
  saveGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 13,
  },
  saveText: { fontFamily: FONTS.bold, fontSize: 15, color: '#fff', marginLeft: 6 },

  aiCta: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.card,
    padding: SPACING.lg, marginTop: SPACING.md,
  },
  aiCtaLeft: { flexDirection: 'row', alignItems: 'center' },
  aiCtaIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.secondary + '18',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  aiCtaTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },
  aiCtaSub: { fontFamily: FONTS.regular, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
});
