import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { loadRecentFoods } from '../../store/nutritionStore';

const OFF_API_URL = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=';
const OFF_API_SUFFIX = '&search_simple=1&action=process&json=1&page_size=20';

export default function LogFoodScreen({ route }) {
  const navigation = useNavigation();
  const { mealType } = route.params || { mealType: 'Breakfast' };
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentFoods, setRecentFoods] = useState([]);

  useEffect(() => {
    const load = async () => {
      const recents = await loadRecentFoods();
      setRecentFoods(recents);
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 2) {
        searchFood(query);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const searchFood = async (q) => {
    setLoading(true);
    try {
      const resp = await fetch(`${OFF_API_URL}${encodeURIComponent(q)}${OFF_API_SUFFIX}`);
      const data = await resp.json();
      setResults(data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderFoodItem = (item, isRecent = false) => {
    const name = item.product_name || item.foodName || 'Unknown Product';
    const brand = item.brands || item.brand || '';
    const kcal = item.nutriments?.['energy-kcal_100g'] || item.calories || 0;
    const protein = item.nutriments?.protein_100g || item.protein || 0;

    return (
      <TouchableOpacity
        key={item._id || item.id}
        style={s.item}
        onPress={() => navigation.navigate('FoodDetail', { food: item, mealType })}
      >
        <View style={s.itemIcon}>
          {item.image_front_small_url ? (
            <Image source={{ uri: item.image_front_small_url }} style={s.foodImg} />
          ) : (
            <MaterialCommunityIcons name="food-variant" size={24} color={COLORS.textLight} />
          )}
        </View>
        <View style={s.itemInfo}>
          <Text style={s.itemName} numberOfLines={1}>{name}</Text>
          <Text style={s.itemSub}>{brand ? `${brand} • ` : ''}{Math.round(kcal)} kcal / 100g</Text>
        </View>
        <Ionicons name="add-circle" size={26} color={COLORS.primary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Log {mealType}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Scanner', { mealType })}>
          <MaterialCommunityIcons name="barcode-scan" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search for a food..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : query.length > 2 ? (
          <>
            <Text style={s.sectionTitle}>Search Results</Text>
            {results.length > 0 ? results.map(p => renderFoodItem(p)) : <Text style={s.noResults}>No foods found</Text>}
          </>
        ) : (
          <>
            {recentFoods.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Recently Logged</Text>
                {recentFoods.map(f => renderFoodItem(f, true))}
              </>
            )}
            <Text style={s.sectionTitle}>Common Foods</Text>
            {/* Mock some common foods if needed */}
            <Text style={s.hint}>Start typing to search over 3 million products via Open Food Facts.</Text>
          </>
        )}
      </ScrollView>
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
  
  searchWrap: { padding: SPACING.lg, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 48
  },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: FONTS.medium, fontSize: 15, color: COLORS.textDark },
  
  scroll: { padding: SPACING.lg },
  sectionTitle: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: SPACING.md, letterSpacing: 0.5 },
  item: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm
  },
  itemIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  foodImg: { width: '100%', height: '100%' },
  itemInfo: { flex: 1, marginLeft: SPACING.md },
  itemName: { fontFamily: FONTS.bold, fontSize: 15, color: COLORS.textDark },
  itemSub: { fontFamily: FONTS.medium, fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  noResults: { fontFamily: FONTS.medium, fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 20 },
  hint: { fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 20, paddingHorizontal: 20 },
});
