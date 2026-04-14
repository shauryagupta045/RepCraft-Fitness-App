import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Mock data for the chart and history
const MOCK_SESSIONS = [
  {
    id: '1',
    date: 'March 15, 2024',
    routine: 'LEG DAY #4',
    volume: '5,400kg',
    sets: 5,
    topSet: '90kg x 5',
    avgRpe: 8.5,
  },
  {
    id: '2',
    date: 'March 12, 2024',
    routine: 'CHEST FOCUS',
    volume: '4,800kg',
    sets: 4,
    topSet: '85kg x 8',
    avgRpe: 9.0,
  },
  {
    id: '3',
    date: 'March 08, 2024',
    routine: 'UPPER BODY A',
    volume: '4,200kg',
    sets: 4,
    topSet: '80kg x 10',
    avgRpe: 7.5,
  },
];

export default function ExerciseHistoryScreen({ route, navigation }) {
  const { exercise } = route.params || {};
  const [activeRange, setActiveRange] = useState('1M');
  const [activeMetric, setActiveMetric] = useState('Weight');

  const exName = exercise?.name || 'Barbell Bench Press';
  const exCategory = (exercise?.muscle || 'Chest').toUpperCase();
  const exDesc = exercise?.description || 'Compound movement for pectoral development';

  return (
    <SafeAreaView style={s.container}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>RepCraft</Text>
        <TouchableOpacity style={s.headerBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* IDENTITY SECTION */}
        <View style={s.identitySection}>
          <View style={s.categoryPill}>
            <Text style={s.categoryText}>{exCategory}</Text>
          </View>
          <Text style={s.title}>{exName}</Text>
          <Text style={s.subtitle}>{exDesc}</Text>
        </View>

        {/* SUMMARY CARDS ROW */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, SHADOWS.sm]}>
            <Text style={s.summaryLabel}>CURRENT PR</Text>
            <View style={s.summaryValueRow}>
              <Text style={s.summaryValue}>102.5</Text>
              <Text style={s.summaryUnit}>kg</Text>
            </View>
            <View style={s.summaryDateRow}>
              <Ionicons name="calendar-outline" size={14} color="#D96055" />
              <Text style={s.summaryDate}>Jan 12, 2024</Text>
            </View>
          </View>

          <View style={[s.summaryCard, SHADOWS.sm]}>
            <Text style={[s.summaryLabel, { color: '#0F766E' }]}>LAST SESSION</Text>
            <View style={s.summaryValueRow}>
              <Text style={s.summaryValue}>80</Text>
              <Text style={s.summaryUnitSmall}>kg x 8</Text>
            </View>
            <View style={s.summaryDateRow}>
              <Ionicons name="time-outline" size={14} color="#0F766E" />
              <Text style={s.summaryDate}>3 days ago</Text>
            </View>
          </View>
        </View>

        {/* PROGRESS CHART SECTION */}
        <View style={[s.chartCard, SHADOWS.sm]}>
          <View style={s.chartHeader}>
            <View>
              <Text style={s.chartTitle}>Progress Over</Text>
              <Text style={s.chartTitle}>Time</Text>
            </View>
            
            <View style={s.rangeSelector}>
              {['1M', '3M', '6M', '1Y'].map(range => (
                <TouchableOpacity 
                  key={range} 
                  onPress={() => setActiveRange(range)}
                  style={[s.rangeBtn, activeRange === range && s.rangeBtnActive]}
                >
                  <Text style={[s.rangeText, activeRange === range && s.rangeTextActive]}>{range}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.metricToggles}>
            {['Weight', 'Volume', 'Reps'].map(metric => (
              <TouchableOpacity 
                key={metric}
                onPress={() => setActiveMetric(metric)}
                style={[
                  s.metricBtn, 
                  activeMetric === metric && (
                    metric === 'Weight' ? s.metricBtnWeight : 
                    metric === 'Volume' ? s.metricBtnVolume : s.metricBtnReps
                  )
                ]}
              >
                <View style={[
                  s.metricDot, 
                  { backgroundColor: metric === 'Weight' ? '#FF7D6B' : metric === 'Volume' ? '#0F766E' : '#94A3B8' }
                ]} />
                <Text style={[s.metricText, activeMetric === metric && s.metricTextActive]}>{metric}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* LINE CHART MOCKUP */}
          <View style={s.chartMock}>
            <LinearGradient
              colors={['rgba(217, 96, 85, 0.15)', 'rgba(217, 96, 85, 0)']}
              style={s.chartGradient}
            />
            <View style={s.chartLine}>
              {/* Fake line points */}
              <View style={[s.chartDot, { left: '0%', bottom: '20%' }]} />
              <View style={[s.chartDot, { left: '25%', bottom: '35%' }]} />
              <View style={[s.chartDot, { left: '50%', bottom: '55%' }]} />
              <View style={[s.chartDot, { left: '75%', bottom: '50%' }]} />
              <View style={[s.chartDot, { left: '100%', bottom: '80%' }]} />
              
              {/* Simple connecting line visual */}
              <View style={s.chartStroke} />
            </View>
          </View>
        </View>

        {/* SESSION HISTORY SECTION */}
        <Text style={s.sectionTitle}>Session History</Text>
        
        {MOCK_SESSIONS.map((item) => (
          <View key={item.id} style={[s.historyCard, SHADOWS.sm]}>
            <View style={s.historyHeader}>
              <View>
                <Text style={s.historyDate}>{item.date}</Text>
                <Text style={s.historyRoutine}>{item.routine}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.historyVolume}>{item.volume}</Text>
                <Text style={s.totalVolumeLabel}>TOTAL VOLUME</Text>
              </View>
            </View>

            <View style={s.historyStatsRow}>
              <View style={s.historyStat}>
                <Text style={s.historyStatLabel}>SETS</Text>
                <Text style={s.historyStatValue}>{item.sets}</Text>
              </View>
              <View style={s.historyStat}>
                <Text style={s.historyStatLabel}>TOP SET</Text>
                <Text style={s.historyStatValue}>{item.topSet}</Text>
              </View>
              <View style={s.historyStat}>
                <Text style={s.historyStatLabel}>AVG RPE</Text>
                <Text style={s.historyStatValue}>{item.avgRpe}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={s.viewAllBtn}>
          <Text style={s.viewAllText}>View All Session History</Text>
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
    paddingVertical: 15
  },
  headerBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: FONTS.black, fontSize: 20, color: COLORS.textDark },
  
  scroll: { paddingHorizontal: 24, paddingBottom: 50 },

  identitySection: { marginTop: 10, marginBottom: 25 },
  categoryPill: {
    backgroundColor: '#8DF2CB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  categoryText: { fontFamily: FONTS.bold, fontSize: 10, color: '#17584D' },
  title: { fontFamily: FONTS.black, fontSize: 32, color: '#1A1A1A', marginBottom: 6, letterSpacing: -0.5 },
  subtitle: { fontFamily: FONTS.medium, fontSize: 14, color: '#8A92A6', lineHeight: 20 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    width: '48%'
  },
  summaryLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#D96055', letterSpacing: 0.5, marginBottom: 8 },
  summaryValueRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  summaryValue: { fontFamily: FONTS.black, fontSize: 28, color: '#1A1A1A' },
  summaryUnit: { fontFamily: FONTS.bold, fontSize: 14, color: '#1A1A1A', marginLeft: 4 },
  summaryUnitSmall: { fontFamily: FONTS.bold, fontSize: 14, color: '#8A92A6', marginLeft: 4 },
  summaryDateRow: { flexDirection: 'row', alignItems: 'center' },
  summaryDate: { fontFamily: FONTS.medium, fontSize: 11, color: '#8A92A6', marginLeft: 6 },

  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 30
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  chartTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#1A1A1A', lineHeight: 22 },
  rangeSelector: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, padding: 4 },
  rangeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  rangeBtnActive: { backgroundColor: '#FFF' },
  rangeText: { fontFamily: FONTS.bold, fontSize: 10, color: '#64748B' },
  rangeTextActive: { color: '#0F172A' },

  metricToggles: { flexDirection: 'row', marginBottom: 20 },
  metricBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC'
  },
  metricBtnWeight: { backgroundColor: '#FF7D6B20', borderColor: '#FF7D6B' },
  metricBtnVolume: { backgroundColor: '#0F766E20', borderColor: '#0F766E' },
  metricBtnReps: { backgroundColor: '#94A3B820', borderColor: '#94A3B8' },
  metricDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  metricText: { fontFamily: FONTS.bold, fontSize: 12, color: '#64748B' },
  metricTextActive: { color: '#1E293B' },

  chartMock: { height: 160, justifyContent: 'flex-end', paddingTop: 20 },
  chartGradient: { ...StyleSheet.absoluteFillObject, marginTop: 40, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  chartLine: { flex: 1, position: 'relative' },
  chartDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#0F766E', zIndex: 2 },
  chartStroke: { position: 'absolute', left: 0, right: 0, bottom: '40%', height: 2, backgroundColor: '#FF7D6B', opacity: 0.3 },

  sectionTitle: { fontFamily: FONTS.black, fontSize: 20, color: '#1A1A1A', marginBottom: 20 },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  historyDate: { fontFamily: FONTS.bold, fontSize: 16, color: '#1E293B' },
  historyRoutine: { fontFamily: FONTS.bold, fontSize: 11, color: '#94A3B8', letterSpacing: 0.5 },
  historyVolume: { fontFamily: FONTS.bold, fontSize: 16, color: '#1E293B' },
  totalVolumeLabel: { fontFamily: FONTS.bold, fontSize: 9, color: '#0F766E', letterSpacing: 0.5, textAlign: 'right' },
  
  historyStatsRow: { 
    flexDirection: 'row', 
    backgroundColor: '#F8FAFC', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 8 
  },
  historyStat: { flex: 1, alignItems: 'center' },
  historyStatLabel: { fontFamily: FONTS.bold, fontSize: 9, color: '#94A3B8', marginBottom: 4 },
  historyStatValue: { fontFamily: FONTS.bold, fontSize: 15, color: '#1E293B' },

  viewAllBtn: { 
    backgroundColor: '#F8FAFC', 
    borderRadius: 16, 
    paddingVertical: 18, 
    alignItems: 'center', 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  viewAllText: { fontFamily: FONTS.bold, fontSize: 14, color: '#1E293B' }
});
