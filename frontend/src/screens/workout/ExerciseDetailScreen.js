import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exercise } = route.params || {};

  // Mock data to match image
  const [sets, setSets] = useState([
    { id: '1', setLabel: 'W', prev: '80×5', reps: '12', kg: '80' },
    { id: '2', setLabel: '2', prev: '80×5', reps: '12', kg: '80' },
    { id: '3', setLabel: '3', prev: '80×5', reps: '10', kg: '80' },
  ]);

  const updateSet = (id, field, val) => {
    setSets(p => p.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const removeSet = (id) => {
    setSets(p => p.filter(s => s.id !== id));
  };

  const addSet = () => {
    const nextLabel = String(sets.length + 1);
    setSets(p => [...p, {
      id: Date.now().toString(),
      setLabel: nextLabel,
      prev: '-',
      reps: '',
      kg: ''
    }]);
  };

  const exName = exercise?.name || 'Bench Press';

  return (
    <SafeAreaView style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#D96055" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{exName}</Text>
        <TouchableOpacity style={s.headerBtn}>
          <Ionicons name="time-outline" size={24} color="#D96055" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* PERSONAL BEST CARD */}
        <View style={[s.pbCard, SHADOWS.sm]}>
          {/* Trophy Watermark */}
          <View style={s.pbWatermark}>
             <Ionicons name="trophy-outline" size={120} color="#FAF0EF" />
          </View>
          
          <View style={s.pbContent}>
            <View style={s.pbLabelRow}>
              <Ionicons name="trophy" size={14} color="#D96055" />
              <Text style={s.pbLabelText}>PERSONAL BEST</Text>
            </View>
            <View style={s.pbValueRow}>
              <Text style={s.pbValue}>225</Text>
              <Text style={s.pbUnit}>lbs</Text>
            </View>
          </View>
        </View>

        {/* SETS MANAGER GRID */}
        <View style={[s.setsCard, SHADOWS.sm]}>
          <View style={s.tableHeader}>
            <Text style={[s.thText, { flex: 0.8 }]}>SET</Text>
            <Text style={[s.thText, { flex: 1.5 }]}>PREV</Text>
            <Text style={[s.thText, { flex: 1, textAlign: 'center' }]}>REPS</Text>
            <Text style={[s.thText, { flex: 1, textAlign: 'center' }]}>KG</Text>
            <View style={{ width: 34 }} />
          </View>

          {sets.map((item) => (
            <View key={item.id} style={s.setRow}>
              <Text style={[s.setColTextBold, { flex: 0.8 }]}>{item.setLabel}</Text>
              <Text style={[s.setColTextFaint, { flex: 1.5 }]}>{item.prev}</Text>
              
              <View style={[s.inputWrap, { flex: 1 }]}>
                <TextInput
                  style={s.inputField}
                  value={item.reps}
                  onChangeText={(v) => updateSet(item.id, 'reps', v)}
                  keyboardType="numeric"
                />
              </View>

              <View style={[s.inputWrap, { flex: 1, marginLeft: 8 }]}>
                <TextInput
                  style={s.inputField}
                  value={item.kg}
                  onChangeText={(v) => updateSet(item.id, 'kg', v)}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity onPress={() => removeSet(item.id)} style={s.trashBtn}>
                <Ionicons name="trash-outline" size={18} color="#E8C5C1" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={addSet} style={s.addSetBtn}>
            <Text style={s.addSetText}>+ Add Set</Text>
          </TouchableOpacity>
        </View>

        {/* VIEW HISTORY SECTION */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[s.historyCard, SHADOWS.sm]}
          onPress={() => navigation.navigate('ExerciseHistory', { exercise })}
        >
          <View style={s.historyIconBox}>
            <Ionicons name="trending-up" size={24} color="#17584D" />
          </View>
          <View style={s.historyTextWrap}>
            <Text style={s.historyTitle}>View Exercise History</Text>
            <Text style={s.historySub}>Analyze your progression over 6 months</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#E8C5C1" />
        </TouchableOpacity>

        {/* WATCH FORM GUIDE SECTION */}
        <TouchableOpacity activeOpacity={0.9} style={s.guideCard}>
          <View style={s.guideOverlay}>
             {/* Abstract background suggesting a video frame */}
             <View style={s.playBtnLarge}>
                <Ionicons name="play" size={24} color="#FFF" style={{ marginLeft: 2 }} />
             </View>
          </View>
          <View style={s.guideContent}>
             <View style={s.playBtnSmall}>
                <Ionicons name="play" size={14} color="#FFF" style={{ marginLeft: 1 }} />
             </View>
             <Text style={s.guideText}>Watch Form Guide</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20
  },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#1A1A1A' },
  
  scroll: { paddingHorizontal: 20, paddingBottom: 50 },

  // PB Card
  pbCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative'
  },
  pbWatermark: {
    position: 'absolute',
    right: -20,
    top: -10,
    opacity: 1
  },
  pbContent: { zIndex: 1 },
  pbLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pbLabelText: { fontFamily: FONTS.bold, fontSize: 11, color: '#8F6662', letterSpacing: 1.5, marginLeft: 6 },
  pbValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  pbValue: { fontFamily: FONTS.black, fontSize: 56, color: '#1A1A1A', letterSpacing: -1.5 },
  pbUnit: { fontFamily: FONTS.medium, fontSize: 18, color: '#8F6662', marginLeft: 6 },

  // Sets Grid
  setsCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingBottom: 16,
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 8
  },
  thText: { fontFamily: FONTS.bold, fontSize: 10, color: '#8C7775', letterSpacing: 1 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5'
  },
  setColTextBold: { fontFamily: FONTS.black, fontSize: 16, color: '#333' },
  setColTextFaint: { fontFamily: FONTS.medium, fontSize: 14, color: '#E8C5C1' },
  inputWrap: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputField: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#1A1A1A',
    textAlign: 'center',
    width: '100%',
    padding: 0
  },
  trashBtn: { width: 34, alignItems: 'flex-end' },
  addSetBtn: { marginTop: 16, alignSelf: 'center' },
  addSetText: { fontFamily: FONTS.bold, fontSize: 14, color: '#D96055' },

  // History Card
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 24
  },
  historyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8DF2CB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  historyTextWrap: { flex: 1 },
  historyTitle: { fontFamily: FONTS.bold, fontSize: 15, color: '#1A1A1A', marginBottom: 2 },
  historySub: { fontFamily: FONTS.regular, fontSize: 12, color: '#8A92A6' },

  // Guide Card
  guideCard: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#000',
    position: 'relative'
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playBtnLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(217, 96, 85, 0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  guideContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  playBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F57D71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  guideText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFF' }
});
