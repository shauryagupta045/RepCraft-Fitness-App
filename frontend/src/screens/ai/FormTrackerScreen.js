import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function FormTrackerScreen({ navigation }) {
  const [exercise, setExercise] = useState('Push-ups');
  const [targetReps, setTargetReps] = useState(15);
  const [testCamera, setTestCamera] = useState(true);

  const EXERCISES = ['Push-ups', 'Squats', 'Pull-ups', 'Plank', 'Lunges'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form Tracker</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Setup Visualization Card */}
        <View style={styles.vizCard}>
          <View style={styles.vizContent}>
            <MaterialCommunityIcons name="cellphone-screenshot" size={100} color="#E5E7EB" style={styles.vizIcon} />
            <View style={styles.stickManContainer}>
              <View style={styles.stickMan} />
              <View style={styles.stickManHead} />
            </View>
            <Text style={styles.vizLabel}>SETUP VISUALIZATION</Text>
          </View>
        </View>

        {/* Exercise Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your exercise</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {EXERCISES.map((ex) => (
              <TouchableOpacity
                key={ex}
                onPress={() => setExercise(ex)}
                style={[styles.chip, exercise === ex && styles.activeChip]}
              >
                <Text style={[styles.chipText, exercise === ex && styles.activeChipText]}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Target Reps Stepper */}
        <View style={styles.repsCard}>
          <Text style={styles.repsLabel}>TARGET REPS</Text>
          <View style={styles.stepper}>
            <TouchableOpacity 
              onPress={() => setTargetReps(Math.max(1, targetReps - 1))}
              style={styles.stepperBtn}
            >
              <Ionicons name="remove" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.repsValue}>{targetReps}</Text>
            <TouchableOpacity 
              onPress={() => setTargetReps(targetReps + 1)}
              style={styles.stepperBtn}
            >
              <Ionicons name="add" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          <Text style={styles.repsSub}>We'll count your reps automatically</Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Position your phone</Text>
          <View style={styles.instructionList}>
            {[
              "Place phone on flat surface.",
              "Full body visible in frame.",
              "Press Start when in position."
            ].map((text, i) => (
              <View key={i} style={styles.instructionItem}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepText}>{i + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Camera Position Test */}
        <View style={styles.cameraSection}>
          <View style={styles.cameraHeader}>
            <View style={styles.cameraIconWrap}>
              <Ionicons name="videocam" size={20} color={COLORS.textDark} />
            </View>
            <Text style={styles.cameraTitle}>Test camera position</Text>
            <Switch 
              value={testCamera} 
              onValueChange={setTestCamera}
              trackColor={{ false: '#E5E7EB', true: '#FF8A65' }}
              thumbColor={'#fff'}
            />
          </View>

          {testCamera && (
            <View style={styles.cameraPreview}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
              
              <View style={styles.readyBadge}>
                <View style={styles.readyDot} />
                <Text style={styles.readyText}>CAMERA READY</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Button Space */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Start Button Fixed at Bottom */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} activeOpacity={0.9}>
          <Text style={styles.startBtnText}>Start Training</Text>
          <Ionicons name="play" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: { fontFamily: FONTS.black, fontSize: 20, color: '#1A2138' },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIcon: { padding: 4 },
  content: { padding: 20 },

  vizCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 32,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  vizContent: { alignItems: 'center' },
  vizIcon: { transform: [{ rotate: '15deg' }], marginBottom: -40, opacity: 0.5 },
  stickManContainer: { width: 100, height: 20, alignItems: 'center' },
  stickMan: { width: 60, height: 4, backgroundColor: '#9BA3AF', borderRadius: 2 },
  stickManHead: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#9BA3AF', position: 'absolute', right: -5, top: -10 },
  vizLabel: { fontFamily: FONTS.bold, fontSize: 13, color: '#9BA3AF', marginTop: 40, letterSpacing: 0.5 },

  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: FONTS.black, fontSize: 18, color: '#1A2138', marginBottom: 16 },
  chipRow: { gap: 12, paddingRight: 20 },
  chip: { 
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, 
    backgroundColor: '#E5E7EB', borderWeight: 1.5, borderColor: 'transparent' 
  },
  activeChip: { backgroundColor: '#E8705E' },
  chipText: { fontFamily: FONTS.bold, fontSize: 15, color: '#4B5563' },
  activeChipText: { color: '#fff' },

  repsCard: { 
    backgroundColor: '#fff', borderRadius: 32, padding: 24, alignItems: 'center', marginBottom: 24,
    ...SHADOWS.card
  },
  repsLabel: { fontFamily: FONTS.bold, fontSize: 12, color: '#9BA3AF', letterSpacing: 1, marginBottom: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  stepperBtn: { 
    width: 48, height: 48, borderRadius: 24, borderWeight: 1.5, borderColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB'
  },
  repsValue: { fontFamily: FONTS.black, fontSize: 52, color: '#1A2138' },
  repsSub: { fontFamily: FONTS.medium, fontSize: 13, color: '#9BA3AF', marginTop: 12 },

  instructionList: { gap: 16 },
  instructionItem: { 
    flexDirection: 'row', alignItems: 'center', gap: 16, 
    backgroundColor: '#F9FAFB', padding: 16, borderRadius: 24 
  },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8705E', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: FONTS.bold, fontSize: 14, color: '#fff' },
  instructionText: { fontFamily: FONTS.medium, fontSize: 15, color: '#1A2138' },

  cameraSection: { backgroundColor: '#fff', borderRadius: 32, padding: 20, ...SHADOWS.card, marginBottom: 100 },
  cameraHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cameraIconWrap: { 
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', 
    alignItems: 'center', justifyContent: 'center', marginRight: 12 
  },
  cameraTitle: { flex: 1, fontFamily: FONTS.bold, fontSize: 16, color: '#1A2138' },
  cameraPreview: { 
    height: 180, backgroundColor: '#F3F4F6', borderRadius: 24, position: 'relative',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
  },
  readyBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    backgroundColor: '#1F2937', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 
  },
  readyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  readyText: { fontFamily: FONTS.bold, fontSize: 11, color: '#fff', letterSpacing: 0.5 },
  
  cornerTL: { position: 'absolute', top: 20, left: 20, width: 20, height: 20, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#E8705E' },
  cornerTR: { position: 'absolute', top: 20, right: 20, width: 20, height: 20, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#E8705E' },
  cornerBL: { position: 'absolute', bottom: 20, left: 20, width: 20, height: 20, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#E8705E' },
  cornerBR: { position: 'absolute', bottom: 20, right: 20, width: 20, height: 20, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#E8705E' },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    padding: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1, borderTopColor: '#F1F2F4'
  },
  startBtn: { 
    backgroundColor: '#E8705E', height: 60, borderRadius: 30, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    ...SHADOWS.primary
  },
  startBtnText: { fontFamily: FONTS.bold, fontSize: 18, color: '#fff' },
});
