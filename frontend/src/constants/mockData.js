export const MOCK_USER = {
  id: '',
  name: '',
  email: '',
  goal: '',
  level: '',
  streak: 0,
  avatar: null,
  weight: 0,
  height: 0,
  age: 0,
};

export const MOCK_METRICS = {
  today: {
    water: 0,
    sleep: 0,
    steps: 0,
    caloriesBurned: 0,
    caloriesConsumed: 0,
    fatigue: 0,
    didWorkout: false,
  },
  week: [
    { day: 'Mon', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Tue', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Wed', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Thu', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Fri', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Sat', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Sun', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
  ],
  lastWeek: [
    { day: 'Mon', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Tue', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Wed', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Thu', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Fri', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Sat', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
    { day: 'Sun', water: 0, sleep: 0, steps: 0, caloriesBurned: 0 },
  ],
  monthly: [],
};

export const MOCK_ROUTINES = [];

export const MOCK_WORKOUT_LOGS = [];

export const MOCK_DIET_TARGETS = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  currentCalories: 0,
  currentProtein: 0,
  currentFat: 0,
  currentCarbs: 0,
  currentFiber: 0,
};

export const MOCK_MEAL_LOG = [];

export const MOCK_SUPPLEMENTS = [];

export const MOCK_AI_CHAT = [];

export const MOCK_CARDIO_SESSIONS = [];

export const MOCK_HYROX_SESSIONS = [];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
