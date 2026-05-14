import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { FONTS, COLORS } from '../../../../constants/theme';

const EXERCISES = [
  { key: 'pushup',        label: 'Push-up',        icon: '💪', note: null },
  { key: 'squat',         label: 'Squat',           icon: '🦵', note: null },
  { key: 'bicepCurl',     label: 'Bicep Curl',      icon: '🏋️', note: null },
  { key: 'shoulderPress', label: 'Shoulder Press',  icon: '🙌', note: null },
  { key: 'lunge',         label: 'Lunge',           icon: '🚶', note: null },
  { key: 'plank',         label: 'Plank',           icon: '🧘', note: 'Time-based • no reps' },
];

/**
 * ExercisePicker — bottom-sheet modal for exercise selection.
 * Props: { visible: bool, onSelect: (key: string) => void, onClose: () => void }
 */
export default function ExercisePicker({ visible, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Choose Exercise</Text>

        {EXERCISES.map((ex) => (
          <TouchableOpacity
            key={ex.key}
            style={styles.row}
            activeOpacity={0.75}
            onPress={() => { onSelect(ex.key); onClose(); }}
          >
            <Text style={styles.rowIcon}>{ex.icon}</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>{ex.label}</Text>
              {ex.note && <Text style={styles.rowNote}>{ex.note}</Text>}
            </View>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {/* safe-area spacer for iOS home indicator */}
        <View style={{ height: Platform.OS === 'ios' ? 28 : 12 }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.black,
    fontSize: 20,
    color: '#1A2138',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F4',
  },
  rowIcon: { fontSize: 28, marginRight: 16 },
  rowInfo: { flex: 1 },
  rowLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#1A2138',
  },
  rowNote: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#9BA3AF',
    marginTop: 2,
  },
  rowChevron: {
    fontSize: 22,
    color: '#9BA3AF',
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
  },
  cancelText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
});
