export const MOCK_USER = {
  id: 'user_001',
  name: 'Alex Jordan',
  email: 'alex@repcraft.app',
  goal: 'Build Muscle',
  level: 'Intermediate',
  streak: 14,
  avatar: null,
  weight: 82,
  height: 180,
  age: 28,
};

export const MOCK_METRICS = {
  today: {
    water: 1.75,
    sleep: 7.3,
    steps: 0,
    caloriesBurned: 480,
    caloriesConsumed: 1950,
    fatigue: 2,
    didWorkout: true,
  },
  week: [
    { day: 'Mon', water: 2.1, sleep: 7.5, steps: 8200, caloriesBurned: 520 },
    { day: 'Tue', water: 1.9, sleep: 6.8, steps: 5400, caloriesBurned: 310 },
    { day: 'Wed', water: 2.5, sleep: 8.0, steps: 9100, caloriesBurned: 590 },
    { day: 'Thu', water: 1.6, sleep: 7.1, steps: 7300, caloriesBurned: 440 },
    { day: 'Fri', water: 2.0, sleep: 7.8, steps: 8800, caloriesBurned: 560 },
    { day: 'Sat', water: 1.75, sleep: 7.3, steps: 6842, caloriesBurned: 480 },
    { day: 'Sun', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
  ],
  lastWeek: [
    { day: 'Mon', water: 1.8, sleep: 7.0, steps: 7200, caloriesBurned: 450 },
    { day: 'Tue', water: 2.0, sleep: 7.2, steps: 6100, caloriesBurned: 380 },
    { day: 'Wed', water: 2.2, sleep: 7.9, steps: 8500, caloriesBurned: 540 },
    { day: 'Thu', water: 1.5, sleep: 6.5, steps: 5900, caloriesBurned: 320 },
    { day: 'Fri', water: 1.9, sleep: 7.6, steps: 8200, caloriesBurned: 510 },
    { day: 'Sat', water: 2.3, sleep: 8.2, steps: 9400, caloriesBurned: 620 },
    { day: 'Sun', water: 1.4, sleep: 7.0, steps: 4200, caloriesBurned: 200 },
  ],
  monthly: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2025, 5, i + 1).toISOString().split('T')[0],
    steps: Math.floor(5000 + Math.random() * 7000),
    water: +(1.2 + Math.random() * 1.8).toFixed(1),
    sleep: +(6 + Math.random() * 2.5).toFixed(1),
    caloriesBurned: Math.floor(250 + Math.random() * 450),
    goalMet: Math.random() > 0.4,
  })),
};

export const MOCK_ROUTINES = [
  {
    id: 'r1',
    title: 'Push Day',
    day: 'Monday',
    muscleGroup: 'Chest / Shoulders / Triceps',
    exercises: [
      { id: 'e1', name: 'Bench Press', sets: 4, reps: 8, weight: 80, rest: 90, pr: '85kg' },
      { id: 'e2', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 32, rest: 60, pr: '34kg' },
      { id: 'e3', name: 'Overhead Press', sets: 3, reps: 8, weight: 55, rest: 90, pr: '57.5kg' },
      { id: 'e4', name: 'Lateral Raise', sets: 3, reps: 15, weight: 12, rest: 45, pr: '14kg' },
      { id: 'e5', name: 'Tricep Pushdown', sets: 3, reps: 12, weight: 30, rest: 45, pr: '32kg' },
    ],
  },
  {
    id: 'r2',
    title: 'Pull Day',
    day: 'Tuesday',
    muscleGroup: 'Back / Biceps',
    exercises: [
      { id: 'e6', name: 'Deadlift', sets: 4, reps: 5, weight: 120, rest: 180, pr: '130kg' },
      { id: 'e7', name: 'Pull-Up', sets: 3, reps: 8, weight: 0, rest: 90, pr: '10 reps' },
      { id: 'e8', name: 'Barbell Row', sets: 4, reps: 8, weight: 70, rest: 90, pr: '75kg' },
      { id: 'e9', name: 'Cable Row', sets: 3, reps: 12, weight: 55, rest: 60, pr: '60kg' },
      { id: 'e10', name: 'Bicep Curl', sets: 3, reps: 12, weight: 16, rest: 45, pr: '18kg' },
    ],
  },
  {
    id: 'r3',
    title: 'Leg Day',
    day: 'Thursday',
    muscleGroup: 'Quads / Hamstrings / Glutes',
    exercises: [
      { id: 'e11', name: 'Squat', sets: 4, reps: 6, weight: 100, rest: 180, pr: '110kg' },
      { id: 'e12', name: 'Romanian Deadlift', sets: 3, reps: 10, weight: 80, rest: 90, pr: '85kg' },
      { id: 'e13', name: 'Leg Press', sets: 3, reps: 12, weight: 160, rest: 90, pr: '180kg' },
      { id: 'e14', name: 'Leg Curl', sets: 3, reps: 12, weight: 50, rest: 60, pr: '55kg' },
      { id: 'e15', name: 'Calf Raise', sets: 4, reps: 15, weight: 60, rest: 30, pr: '70kg' },
    ],
  },
];

export const MOCK_WORKOUT_LOGS = [
  { id: 'l1', date: '2025-06-07', routineId: 'r1', duration: 58, effort: 8 },
  { id: 'l2', date: '2025-06-06', routineId: 'r2', duration: 62, effort: 7 },
  { id: 'l3', date: '2025-06-05', routineId: 'r3', duration: 71, effort: 9 },
  { id: 'l4', date: '2025-06-04', routineId: 'r1', duration: 55, effort: 7 },
  { id: 'l5', date: '2025-06-03', routineId: 'r2', duration: 68, effort: 6 },
  { id: 'l6', date: '2025-05-31', routineId: 'r3', duration: 75, effort: 9 },
  { id: 'l7', date: '2025-05-30', routineId: 'r1', duration: 52, effort: 7 },
];

export const MOCK_DIET_TARGETS = {
  calories: 2400,
  protein: 180,
  fat: 70,
  carbs: 260,
  fiber: 35,
  currentCalories: 1950,
  currentProtein: 145,
  currentFat: 58,
  currentCarbs: 210,
  currentFiber: 22,
};

export const MOCK_MEAL_LOG = [
  { id: 'm1', name: 'Protein Oats', weight: '350g', calories: 420, protein: '35g P' },
  { id: 'm2', name: 'Salmon Bowl', weight: '450g', calories: 680, protein: '45g P' },
];

export const MOCK_SUPPLEMENTS = [
  { id: 's1', name: 'Creatine', time: '08:00', taken: true, dose: '5g' },
  { id: 's2', name: 'Whey Protein', time: '13:00', taken: true, dose: '30g' },
  { id: 's3', name: 'Vitamin D3', time: '08:00', taken: false, dose: '2000IU' },
  { id: 's4', name: 'Omega-3', time: '20:00', taken: false, dose: '1g' },
  { id: 's5', name: 'Magnesium', time: '22:00', taken: false, dose: '400mg' },
];

export const MOCK_AI_CHAT = [
  {
    id: 'm1',
    role: 'assistant',
    text: "Hey Alex! Ready to crush it today? Your readiness score is looking solid at 78. You got 7h 20m of sleep and your streak is at 14 days — impressive! What can I help you with?",
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
];

export const MOCK_CARDIO_SESSIONS = [
  { id: 'c1', type: 'Running', date: '2025-06-06', duration: 35, distance: 5.2, rpe: 7 },
  { id: 'c2', type: 'Cycling', date: '2025-06-04', duration: 45, distance: 18.0, rpe: 6 },
  { id: 'c3', type: 'Rowing', date: '2025-06-01', duration: 20, distance: 4.0, rpe: 8 },
];

export const MOCK_HYROX_SESSIONS = [
  { id: 'h1', type: 'Conditioning', title: 'AMRAP 20', date: '2025-06-05', duration: 25, difficulty: 4, notes: 'Ski erg + wall balls + burpee box jumps' },
  { id: 'h2', type: 'Calisthenics', title: 'Gymnastics Skill', date: '2025-06-02', duration: 30, difficulty: 3, notes: 'Handstand practice, muscle-up progressions' },
];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
