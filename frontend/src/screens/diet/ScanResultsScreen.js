import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function ScanResultsScreen({ navigation, route }) {
  const { food, mealType } = route.params;

  // Simple Health Score logic based on protein density and presence of additives (mocked for demo)
  const calculateScore = () => {
    const nutriments = food.nutriments || {};
    const protein = nutriments.protein_100g || 0;
    const sugar = nutriments.sugars_100g || 0;
    const fat = nutriments.fat_100g || 0;
    
    let score = 50;
    if (protein > 10) score += 20;
    if (sugar < 5) score += 15;
    if (fat < 5) score += 10;
    if (food.additives_n > 5) score -= 20;
    
    return Math.min(100, Math.max(0, score));
  };

  const score = calculateScore();
  const scoreColor = score > 70 ? COLORS.success : score > 40 ? COLORS.warning : COLORS.danger;

  const pros = [];
  const cons = [];

  const nutriments = food.nutriments || {};
  if (nutriments.protein_100g > 15) pros.push('Excellent Protein Source');
  if (nutriments.fiber_100g > 5) pros.push('High in Fiber');
  if (nutriments.sugars_100g < 2) pros.push('Very Low Sugar');
  
  if (nutriments.sugars_100g > 15) cons.push('High Sugar Content');
  if (nutriments['saturated-fat_100g'] > 5) cons.push('High Saturated Fat');
  if (food.additives_n > 3) cons.push(`Contains ${food.additives_n} Additives`);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Analysis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.scoreCard}>
          <View style={[s.scoreRing, { borderColor: scoreColor }]}>
            <Text style={[s.scoreNum, { color: scoreColor }]}>{score}</Text>
            <Text style={s.scoreLabel}>Health Score</Text>
          </View>
          <Text style={s.productName}>{food.product_name}</Text>
          <Text style={s.brandName}>{food.brands}</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Key Insights</Text>
          {pros.map((p, i) => (
            <View key={`pro-${i}`} style={s.insightRow}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={s.insightText}>{p}</Text>
            </View>
          ))}
          {cons.map((c, i) => (
            <View key={`con-${i}`} style={s.insightRow}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
              <Text style={s.insightText}>{c}</Text>
            </View>
          ))}
        </View>

        <View style={s.macroSummary}>
          <View style={s.macroItem}>
            <Text style={s.macroVal}>{Math.round(nutriments['energy-kcal_100g'] || 0)}</Text>
            <Text style={s.macroLabel}>kcal</Text>
          </View>
          <View style={s.macroItem}>
            <Text style={s.macroVal}>{Math.round(nutriments.protein_100g || 0)}g</Text>
            <Text style={s.macroLabel}>Protein</Text>
          </View>
          <View style={s.macroItem}>
            <Text style={s.macroVal}>{Math.round(nutriments.carbs_100g || 0)}g</Text>
            <Text style={s.macroLabel}>Carbs</Text>
          </View>
          <View style={s.macroItem}>
            <Text style={s.macroVal}>{Math.round(nutriments.fat_100g || 0)}g</Text>
            <Text style={s.macroLabel}>Fat</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={s.detailBtn} 
          onPress={() => navigation.navigate('FoodDetail', { food, mealType })}
        >
          <Text style={s.detailBtnText}>View Detailed Macros & Log</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, backgroundColor: '#fff' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: SPACING.lg },
  scoreCard: { backgroundColor: '#fff', borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', ...SHADOWS.md, marginBottom: SPACING.lg },
  scoreRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  scoreNum: { fontFamily: FONTS.black, fontSize: 36 },
  scoreLabel: { fontFamily: FONTS.bold, fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase' },
  productName: { fontFamily: FONTS.black, fontSize: 20, color: COLORS.textDark, textAlign: 'center' },
  brandName: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, marginTop: 4 },

  section: { backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.sm, marginBottom: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: SPACING.md },
  insightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  insightText: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textDark, marginLeft: 10 },

  macroSummary: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
  macroItem: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', marginHorizontal: 4, ...SHADOWS.sm },
  macroVal: { fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark },
  macroLabel: { fontFamily: FONTS.medium, fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase' },

  detailBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...SHADOWS.primary },
  detailBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#fff', marginRight: 10 },
});
