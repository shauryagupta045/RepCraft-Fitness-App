import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Workout Reminder',
    message: 'Time for your daily Upper Body session! You\'re on a 14-day streak.',
    time: '2h ago',
    type: 'workout',
    read: false,
  },
  {
    id: '2',
    title: 'Hydration Goal',
    message: 'You\'ve only drank 1.2L today. Drink 800ml more to reach your goal!',
    time: '4h ago',
    type: 'water',
    read: true,
  },
  {
    id: '3',
    title: 'New Achievement!',
    message: 'Congratulations! You\'ve completed 50 workouts this year.',
    time: 'Yesterday',
    type: 'achievement',
    read: true,
  },
  {
    id: '4',
    title: 'Sleep Analysis',
    message: 'Your sleep quality was 15% better last night. Keep it up!',
    time: '2 days ago',
    type: 'sleep',
    read: true,
  },
  {
    id: '5',
    title: 'Weekly Report',
    message: 'Your weekly progress report is ready. Check your gains!',
    time: '3 days ago',
    type: 'progress',
    read: true,
  },
];

const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'workout':
      return <View style={[styles.iconBox, { backgroundColor: '#E8705E' }]}><Ionicons name="barbell" size={20} color="#fff" /></View>;
    case 'water':
      return <View style={[styles.iconBox, { backgroundColor: '#4A90E2' }]}><Ionicons name="water" size={20} color="#fff" /></View>;
    case 'achievement':
      return <View style={[styles.iconBox, { backgroundColor: '#FFD700' }]}><Ionicons name="trophy" size={20} color="#fff" /></View>;
    case 'sleep':
      return <View style={[styles.iconBox, { backgroundColor: '#7E57C2' }]}><Ionicons name="moon" size={20} color="#fff" /></View>;
    default:
      return <View style={[styles.iconBox, { backgroundColor: '#6C7A87' }]}><Ionicons name="notifications" size={20} color="#fff" /></View>;
  }
};

export default function NotificationScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notiCard, !item.read && styles.unreadCard]}>
      <NotificationIcon type={item.type} />
      <View style={styles.notiContent}>
        <View style={styles.notiHeader}>
          <Text style={styles.notiTitle}>{item.title}</Text>
          <Text style={styles.notiTime}>{item.time}</Text>
        </View>
        <Text style={styles.notiMessage} numberOfLines={2}>{item.message}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.primary,
  },
  list: {
    padding: SPACING.lg,
  },
  notiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  unreadCard: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#FFF9F8',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notiContent: {
    flex: 1,
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notiTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
  },
  notiTime: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  notiMessage: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});
