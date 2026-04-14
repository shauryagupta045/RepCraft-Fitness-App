export const calculateReadiness = (sleep, fatigue, didWorkout) => {
  return Math.min(100, Math.round(
    (sleep / 8) * 40 +
    ((6 - fatigue) / 5) * 35 +
    (didWorkout ? 25 : 0)
  ));
};

export const getReadinessLabel = (score) => {
  if (score >= 85) return { label: 'Excellent', color: '#A8D5BA' };
  if (score >= 70) return { label: 'Good', color: '#6DD5C0' };
  if (score >= 55) return { label: 'Moderate', color: '#FFB347' };
  return { label: 'Low', color: '#FF7D6B' };
};

export const getWaterGoal = () => 2.5; // litres
export const getStepGoal = () => 10000;
export const getSleepGoal = () => 8; // hours

export const normalizeBarData = (data) => {
  const max = Math.max(...data, 1);
  return data.map((v) => (v / max) * 100);
};

export const calculateVolume = (sets) => {
  return sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
};

export const getPercentageChange = (current, previous) => {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const aggregateWeeklyWorkouts = (logs) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const log = logs.find((l) => l.date === dateStr);
    return {
      day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
      completed: !!log,
      duration: log?.duration || 0,
    };
  });
};
