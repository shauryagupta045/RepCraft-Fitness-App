import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { addFoodEntry, getDateKey } from '../../store/nutritionStore';
import { useAuthStore } from '../../store/authStore';

export default function FoodDetailScreen({ navigation, route }) {
  const { food, mealType } = route.params;
  const [grams, setGrams] = useState('100');

  // Open Food Facts uses 100g as base
  const nutriments = food.nutriments || {};
  const baseKcal = nutriments['energy-kcal_100g'] || food.calories || 0;
  const baseP = nutriments.protein_100g || food.protein || 0;
  const baseC = nutriments.carbs_100g || food.carbs || 0;
  const baseF = nutriments.fat_100g || food.fat || 0;
  const baseFib = nutriments.fiber_100g || food.fiber || 0;

  const multiplier = (parseFloat(grams) || 0) / 100;

  const currentKcal = Math.round(baseKcal * multiplier);
  const currentP = Math.round(baseP * multiplier);
  const currentC = Math.round(baseC * multiplier);
  const currentF = Math.round(baseF * multiplier);
  const currentFib = Math.round(baseFib * multiplier);

  const handleLog = async () => {
    const entry = {
      foodId: food._id || food.id,
      foodName: food.product_name || food.foodName,
      brand: food.brands || food.brand,
      grams: parseFloat(grams),
      calories: currentKcal,
      protein: currentP,
      carbs: currentC,
      fat: currentF,
      fiber: currentFib,
      mealType: mealType,
      image: food.image_front_small_url,
    };
    await addFoodEntry(getDateKey(), entry);
    useAuthStore.getState().incrementStreak(); // Diet activity
    navigation.navigate('FoodDiary');
  };

  const MacroBox = ({ label, value, color, unit = 'g' }) => (
    <View style={s.macroBox}>
      <Text style={[s.macroVal, { color }]}>{value}{unit}</Text>
      <Text style={s.macroLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="close" size={26} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Food Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
          <View style={s.topCard}>
            <View style={s.imageWrap}>
              {food.image_front_small_url ? (
                <Image source={{ uri: food.image_front_small_url }} style={s.foodImg} resizeMode="contain" />
              ) : (
                <MaterialCommunityIcons name="food-apple" size={60} color={COLORS.textLight} />
              )}
            </View>
            <Text style={s.foodName}>{food.product_name || food.foodName}</Text>
            <Text style={s.brandName}>{food.brands || food.brand || 'General Product'}</Text>
          </View>

          <View style={s.inputSection}>
            <Text style={s.sectionTitle}>Serving Size</Text>
            <View style={s.inputRow}>
              <TextInput
                style={s.gramInput}
                keyboardType="numeric"
                value={grams}
                onChangeText={setGrams}
                placeholder="0"
              />
              <Text style={s.gramLabel}>grams (g)</Text>
            </View>
          </View>

          <View style={s.nutritionCard}>
            <View style={s.kcalRow}>
              <Text style={s.kcalNum}>{currentKcal}</Text>
              <Text style={s.kcalLabel}>Calories (kcal)</Text>
            </View>
            <View style={s.macroRow}>
              <MacroBox label="Protein" value={currentP} color="#14726B" />
              <MacroBox label="Carbs" value={currentC} color="#4A6563" />
              <MacroBox label="Fat" value={currentF} color="#A84C42" />
              <MacroBox label="Fiber" value={currentFib} color="#6C8FC7" />
            </View>
          </View>

          <View style={s.infoList}>
            <View style={s.infoItem}>
              <Text style={s.infoKey}>Meal</Text>
              <Text style={s.infoVal}>{mealType}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoKey}>Category</Text>
              <Text style={s.infoVal}>{food.categories_tags?.[0]?.replace('en:', '') || 'Misc'}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.logBtn} onPress={handleLog}>
            <Text style={s.logBtnText}>Log to {mealType}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: '#fff'
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },

  scroll: { padding: SPACING.lg },
  topCard: { alignItems: 'center', marginBottom: SPACING.xl },
  imageWrap: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.md, marginBottom: SPACING.lg,
    overflow: 'hidden'
  },
  foodImg: { width: '80%', height: '80%' },
  foodName: { fontFamily: FONTS.black, fontSize: 22, color: COLORS.textDark, textAlign: 'center' },
  brandName: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, marginTop: 4 },

  inputSection: { marginBottom: SPACING.xl },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: SPACING.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.sm },
  gramInput: { flex: 1, fontFamily: FONTS.bold, fontSize: 24, color: COLORS.primary },
  gramLabel: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },

  nutritionCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.xl, marginBottom: SPACING.xl, ...SHADOWS.md },
  kcalRow: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: SPACING.lg, marginBottom: SPACING.lg },
  kcalNum: { fontFamily: FONTS.black, fontSize: 40, color: COLORS.textDark },
  kcalLabel: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroBox: { alignItems: 'center' },
  macroVal: { fontFamily: FONTS.bold, fontSize: 18 },
  macroLabel: { fontFamily: FONTS.medium, fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  infoList: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.sm },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  infoKey: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted },
  infoVal: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark },

  footer: { padding: SPACING.lg, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  logBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', ...SHADOWS.primary },
  logBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff' },
});
