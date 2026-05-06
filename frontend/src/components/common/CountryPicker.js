import React, { useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

const COUNTRIES = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
];

export default function CountryPicker({ selectedCountry, onSelect }) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.includes(search)
  );

  return (
    <View>
      <TouchableOpacity 
        style={styles.trigger} 
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <Text style={styles.code}>{selectedCountry.code}</Text>
        <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { setVisible(false); setSearch(''); }}>
              <Ionicons name="close" size={28} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Country</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.item}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                  setSearch('');
                }}
              >
                <Text style={styles.itemFlag}>{item.flag}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCode}>{item.code}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.list}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    height: 54,
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: 8,
    ...SHADOWS.card,
  },
  flag: { fontSize: 20, marginRight: 6 },
  code: { fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark, marginRight: 4 },
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: COLORS.textDark },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textDark,
  },
  list: { paddingHorizontal: SPACING.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemFlag: { fontSize: 24, marginRight: 16 },
  itemName: { flex: 1, fontFamily: FONTS.medium, fontSize: 16, color: COLORS.textDark },
  itemCode: { fontFamily: FONTS.regular, fontSize: 16, color: COLORS.textMuted },
});
