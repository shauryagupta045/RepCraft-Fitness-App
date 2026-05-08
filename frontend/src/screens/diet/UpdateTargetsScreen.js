import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { loadUserProfile, saveUserProfile } from '../../store/nutritionStore';

export default function UpdateTargetsScreen({ navigation }) {
  const [profile, setProfile] = useState({
    name: '',
    targets: { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 },
    metrics: { weight: 70, height: 170, age: 25, goal: 'Maintain', activityLevel: 'Moderate' }
  });

  const [manualOverride, setManualOverride] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await loadUserProfile();
      setProfile(data);
    };
    load();
  }, []);

  const calculateTargets = () => {
    const { weight, height, age, goal, activityLevel } = profile.metrics;
    
    // Mifflin-St Jeor Equation for BMR (Male calculation for demo simplicity)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    
    // Activity Multiplier
    const multipliers = { 'Sedentary': 1.2, 'Light': 1.375, 'Moderate': 1.55, 'Active': 1.725 };
    let tdee = bmr * (multipliers[activityLevel] || 1.2);
    
    // Goal adjustment
    let targetCal = tdee;
    if (goal === 'Cut') targetCal -= 500;
    if (goal === 'Bulk') targetCal += 300;

    targetCal = Math.round(targetCal);
    
    // Macro splits (Protein: 2g/kg, Fat: 0.8g/kg, Rest: Carbs)
    const p = Math.round(weight * 2);
    const f = Math.round(weight * 0.8);
    const c = Math.round((targetCal - (p * 4) - (f * 9)) / 4);
    const fib = Math.round(targetCal / 100); // 10g per 1000kcal

    return { calories: targetCal, protein: p, carbs: c, fat: f, fiber: fib };
  };

  const handleSave = async () => {
    let finalTargets = profile.targets;
    if (!manualOverride) {
      finalTargets = calculateTargets();
    }
    const updatedProfile = { ...profile, targets: finalTargets };
    await saveUserProfile(updatedProfile);
    navigation.goBack();
  };

  const updateMetric = (key, val) => {
    setProfile(p => ({
      ...p,
      metrics: { ...p.metrics, [key]: val }
    }));
  };

  const updateTarget = (key, val) => {
    setProfile(p => ({
      ...p,
      targets: { ...p.targets, [key]: parseInt(val) || 0 }
    }));
  };

  const InputRow = ({ label, value, onChange, unit, keyboardType = 'numeric' }) => (
    <View style={s.inputRow}>
      <Text style={s.inputLabel}>{label}</Text>
      <View style={s.inputFieldWrap}>
        <TextInput
          style={s.textInput}
          value={String(value)}
          onChangeText={onChange}
          keyboardType={keyboardType}
          placeholder="0"
        />
        <Text style={s.unitText}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Update Targets</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <Text style={s.sectionTitle}>Physical Metrics</Text>
          <View style={s.card}>
            <InputRow label="Current Weight" value={profile.metrics.weight} unit="kg" onChange={(v) => updateMetric('weight', parseFloat(v))} />
            <InputRow label="Height" value={profile.metrics.height} unit="cm" onChange={(v) => updateMetric('height', parseFloat(v))} />
            <InputRow label="Age" value={profile.metrics.age} unit="yrs" onChange={(v) => updateMetric('age', parseInt(v))} />
          </View>

          <Text style={s.sectionTitle}>Lifestyle & Goal</Text>
          <View style={s.card}>
            <View style={s.pickerRow}>
              {['Sedentary', 'Light', 'Moderate', 'Active'].map(level => (
                <TouchableOpacity 
                  key={level} 
                  style={[s.chip, profile.metrics.activityLevel === level && s.chipActive]}
                  onPress={() => updateMetric('activityLevel', level)}
                >
                  <Text style={[s.chipText, profile.metrics.activityLevel === level && s.chipTextActive]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.pickerRow, { marginTop: 12 }]}>
              {['Cut', 'Maintain', 'Bulk'].map(g => (
                <TouchableOpacity 
                  key={g} 
                  style={[s.chip, profile.metrics.goal === g && s.chipActive, { flex: 1 }]}
                  onPress={() => updateMetric('goal', g)}
                >
                  <Text style={[s.chipText, profile.metrics.goal === g && s.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.overrideHeader}>
            <Text style={s.sectionTitle}>Daily Targets</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={s.overrideLabel}>Manual Override</Text>
              <Switch value={manualOverride} onValueChange={setManualOverride} trackColor={{ true: COLORS.primary }} />
            </View>
          </View>

          {!manualOverride ? (
            <View style={[s.card, s.autoCard]}>
              <Text style={s.autoTitle}>Calculated for you:</Text>
              <View style={s.autoGrid}>
                {Object.entries(calculateTargets()).map(([k, v]) => (
                  <View key={k} style={s.autoItem}>
                    <Text style={s.autoVal}>{v}{k === 'calories' ? '' : 'g'}</Text>
                    <Text style={s.autoLabel}>{k}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={s.card}>
              <InputRow label="Calories" value={profile.targets.calories} unit="kcal" onChange={(v) => updateTarget('calories', v)} />
              <InputRow label="Protein" value={profile.targets.protein} unit="g" onChange={(v) => updateTarget('protein', v)} />
              <InputRow label="Carbs" value={profile.targets.carbs} unit="g" onChange={(v) => updateTarget('carbs', v)} />
              <InputRow label="Fat" value={profile.targets.fat} unit="g" onChange={(v) => updateTarget('fat', v)} />
              <InputRow label="Fiber" value={profile.targets.fiber} unit="g" onChange={(v) => updateTarget('fiber', v)} />
            </View>
          )}
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
            <Text style={s.saveBtnText}>Save Targets</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, backgroundColor: '#fff' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.lg },
  card: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.sm },
  
  inputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  inputLabel: { fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textDark },
  inputFieldWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: RADIUS.sm, paddingHorizontal: 12, height: 40 },
  textInput: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.primary, width: 60, textAlign: 'right' },
  unitText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted, marginLeft: 6 },

  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.sm, backgroundColor: '#F3F4F6', minWidth: 80, alignItems: 'center' },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontFamily: FONTS.bold, fontSize: 12, color: COLORS.textMuted },
  chipTextActive: { color: '#fff' },

  overrideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.lg },
  overrideLabel: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginRight: 8 },

  autoCard: { backgroundColor: COLORS.dark, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  autoTitle: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff', marginBottom: 12 },
  autoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  autoItem: { width: '30%', marginBottom: 8 },
  autoVal: { fontFamily: FONTS.black, fontSize: 18, color: COLORS.primary },
  autoLabel: { fontFamily: FONTS.medium, fontSize: 10, color: '#9BA3AF', textTransform: 'uppercase' },

  footer: { padding: SPACING.lg, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', ...SHADOWS.primary },
  saveBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },
});
