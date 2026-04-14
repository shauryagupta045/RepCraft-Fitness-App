export const EXERCISES = [
  // Chest
  { id: '1', name: 'Bench Press', muscle: 'Chest', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '2', name: 'Incline Dumbbell Press', muscle: 'Chest', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '3', name: 'Cable Fly', muscle: 'Chest', category: 'Strength', equipment: 'Cable', type: 'Isolation' },
  { id: '4', name: 'Push-Up', muscle: 'Chest', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '5', name: 'Dips', muscle: 'Chest', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '6', name: 'Decline Bench Press', muscle: 'Chest', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '7', name: 'Pec Deck', muscle: 'Chest', category: 'Strength', equipment: 'Machine', type: 'Isolation' },

  // Back
  { id: '8', name: 'Deadlift', muscle: 'Back', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '9', name: 'Pull-Up', muscle: 'Back', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '10', name: 'Barbell Row', muscle: 'Back', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '11', name: 'Cable Row', muscle: 'Back', category: 'Strength', equipment: 'Cable', type: 'Compound' },
  { id: '12', name: 'Lat Pulldown', muscle: 'Back', category: 'Strength', equipment: 'Cable', type: 'Compound' },
  { id: '13', name: 'Single-Arm Dumbbell Row', muscle: 'Back', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '14', name: 'Chest-Supported Row', muscle: 'Back', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '15', name: 'T-Bar Row', muscle: 'Back', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '16', name: 'Face Pull', muscle: 'Back', category: 'Strength', equipment: 'Cable', type: 'Isolation' },

  // Shoulders
  { id: '17', name: 'Overhead Press', muscle: 'Shoulders', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '18', name: 'Lateral Raise', muscle: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', type: 'Isolation' },
  { id: '19', name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '20', name: 'Arnold Press', muscle: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '21', name: 'Rear Delt Fly', muscle: 'Shoulders', category: 'Strength', equipment: 'Dumbbell', type: 'Isolation' },
  { id: '22', name: 'Cable Lateral Raise', muscle: 'Shoulders', category: 'Strength', equipment: 'Cable', type: 'Isolation' },
  { id: '23', name: 'Upright Row', muscle: 'Shoulders', category: 'Strength', equipment: 'Barbell', type: 'Compound' },

  // Arms
  { id: '24', name: 'Bicep Curl', muscle: 'Arms', category: 'Strength', equipment: 'Dumbbell', type: 'Isolation' },
  { id: '25', name: 'Hammer Curl', muscle: 'Arms', category: 'Strength', equipment: 'Dumbbell', type: 'Isolation' },
  { id: '26', name: 'Barbell Curl', muscle: 'Arms', category: 'Strength', equipment: 'Barbell', type: 'Isolation' },
  { id: '27', name: 'Tricep Pushdown', muscle: 'Arms', category: 'Strength', equipment: 'Cable', type: 'Isolation' },
  { id: '28', name: 'Skull Crusher', muscle: 'Arms', category: 'Strength', equipment: 'Barbell', type: 'Isolation' },
  { id: '29', name: 'Overhead Tricep Extension', muscle: 'Arms', category: 'Strength', equipment: 'Dumbbell', type: 'Isolation' },
  { id: '30', name: 'Cable Curl', muscle: 'Arms', category: 'Strength', equipment: 'Cable', type: 'Isolation' },
  { id: '31', name: 'Close-Grip Bench Press', muscle: 'Arms', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '32', name: 'Preacher Curl', muscle: 'Arms', category: 'Strength', equipment: 'Barbell', type: 'Isolation' },

  // Legs
  { id: '33', name: 'Squat', muscle: 'Legs', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '34', name: 'Romanian Deadlift', muscle: 'Legs', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '35', name: 'Leg Press', muscle: 'Legs', category: 'Strength', equipment: 'Machine', type: 'Compound' },
  { id: '36', name: 'Leg Curl', muscle: 'Legs', category: 'Strength', equipment: 'Machine', type: 'Isolation' },
  { id: '37', name: 'Calf Raise', muscle: 'Legs', category: 'Strength', equipment: 'Machine', type: 'Isolation' },
  { id: '38', name: 'Bulgarian Split Squat', muscle: 'Legs', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '39', name: 'Hack Squat', muscle: 'Legs', category: 'Strength', equipment: 'Machine', type: 'Compound' },
  { id: '40', name: 'Leg Extension', muscle: 'Legs', category: 'Strength', equipment: 'Machine', type: 'Isolation' },
  { id: '41', name: 'Sumo Squat', muscle: 'Legs', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '42', name: 'Step-Up', muscle: 'Legs', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '43', name: 'Hip Thrust', muscle: 'Legs', category: 'Strength', equipment: 'Barbell', type: 'Compound' },

  // Core
  { id: '44', name: 'Plank', muscle: 'Core', category: 'Strength', equipment: 'Bodyweight', type: 'Isometric' },
  { id: '45', name: 'Crunch', muscle: 'Core', category: 'Strength', equipment: 'Bodyweight', type: 'Isolation' },
  { id: '46', name: 'Hanging Leg Raise', muscle: 'Core', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '47', name: 'Ab Rollout', muscle: 'Core', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '48', name: 'Russian Twist', muscle: 'Core', category: 'Strength', equipment: 'Bodyweight', type: 'Isolation' },
  { id: '49', name: 'Cable Crunch', muscle: 'Core', category: 'Strength', equipment: 'Cable', type: 'Isolation' },
  { id: '50', name: 'Dead Bug', muscle: 'Core', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '51', name: 'Side Plank', muscle: 'Core', category: 'Strength', equipment: 'Bodyweight', type: 'Isometric' },
  { id: '52', name: 'Pallof Press', muscle: 'Core', category: 'Strength', equipment: 'Cable', type: 'Isometric' },

  // Cardio
  { id: '53', name: 'Running', muscle: 'Cardio', category: 'Cardio', equipment: 'None', type: 'Aerobic' },
  { id: '54', name: 'Cycling', muscle: 'Cardio', category: 'Cardio', equipment: 'Bike', type: 'Aerobic' },
  { id: '55', name: 'Rowing Machine', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', type: 'Aerobic' },
  { id: '56', name: 'Ski Erg', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', type: 'Aerobic' },
  { id: '57', name: 'Battle Ropes', muscle: 'Cardio', category: 'Cardio', equipment: 'Ropes', type: 'HIIT' },
  { id: '58', name: 'Box Jump', muscle: 'Cardio', category: 'Cardio', equipment: 'Box', type: 'HIIT' },
  { id: '59', name: 'Burpee', muscle: 'Cardio', category: 'Cardio', equipment: 'Bodyweight', type: 'HIIT' },
  { id: '60', name: 'Jump Rope', muscle: 'Cardio', category: 'Cardio', equipment: 'Rope', type: 'HIIT' },
  { id: '61', name: 'Assault Bike', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', type: 'HIIT' },
  { id: '62', name: 'Stair Climber', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', type: 'Aerobic' },
  { id: '63', name: 'Elliptical', muscle: 'Cardio', category: 'Cardio', equipment: 'Machine', type: 'Aerobic' },

  // Hyrox movements
  { id: '64', name: 'Sled Push', muscle: 'Legs', category: 'Hyrox', equipment: 'Sled', type: 'Compound' },
  { id: '65', name: 'Sled Pull', muscle: 'Back', category: 'Hyrox', equipment: 'Sled', type: 'Compound' },
  { id: '66', name: 'Wall Ball', muscle: 'Legs', category: 'Hyrox', equipment: 'Ball', type: 'Compound' },
  { id: '67', name: 'Sandbag Lunge', muscle: 'Legs', category: 'Hyrox', equipment: 'Sandbag', type: 'Compound' },
  { id: '68', name: 'Farmers Carry', muscle: 'Back', category: 'Hyrox', equipment: 'Dumbbell', type: 'Compound' },
  { id: '69', name: 'Burpee Broad Jump', muscle: 'Cardio', category: 'Hyrox', equipment: 'Bodyweight', type: 'HIIT' },
  { id: '70', name: 'Roxzone Bike', muscle: 'Cardio', category: 'Hyrox', equipment: 'Machine', type: 'Aerobic' },

  // Olympic
  { id: '71', name: 'Power Clean', muscle: 'Back', category: 'Olympic', equipment: 'Barbell', type: 'Compound' },
  { id: '72', name: 'Clean and Jerk', muscle: 'Shoulders', category: 'Olympic', equipment: 'Barbell', type: 'Compound' },
  { id: '73', name: 'Snatch', muscle: 'Shoulders', category: 'Olympic', equipment: 'Barbell', type: 'Compound' },
  { id: '74', name: 'Push Press', muscle: 'Shoulders', category: 'Olympic', equipment: 'Barbell', type: 'Compound' },

  // Additional popular exercises
  { id: '75', name: 'Glute Bridge', muscle: 'Legs', category: 'Strength', equipment: 'Bodyweight', type: 'Isolation' },
  { id: '76', name: 'Good Morning', muscle: 'Back', category: 'Strength', equipment: 'Barbell', type: 'Compound' },
  { id: '77', name: 'Shrug', muscle: 'Back', category: 'Strength', equipment: 'Barbell', type: 'Isolation' },
  { id: '78', name: 'Wrist Curl', muscle: 'Arms', category: 'Strength', equipment: 'Dumbbell', type: 'Isolation' },
  { id: '79', name: 'Nordic Hamstring Curl', muscle: 'Legs', category: 'Strength', equipment: 'Bodyweight', type: 'Isolation' },
  { id: '80', name: 'Dragon Flag', muscle: 'Core', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '81', name: 'Muscle-Up', muscle: 'Back', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '82', name: 'Pistol Squat', muscle: 'Legs', category: 'Strength', equipment: 'Bodyweight', type: 'Compound' },
  { id: '83', name: 'Single-Leg Deadlift', muscle: 'Legs', category: 'Strength', equipment: 'Dumbbell', type: 'Compound' },
  { id: '84', name: 'Concentration Curl', muscle: 'Arms', category: 'Strength', equipment: 'Dumbbell', type: 'Isolation' },
];

export const EXERCISE_CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

export const MUSCLE_ICONS = {
  Chest: 'body-outline',
  Back: 'body-outline',
  Shoulders: 'body-outline',
  Arms: 'barbell-outline',
  Legs: 'walk-outline',
  Core: 'body-outline',
  Cardio: 'bicycle-outline',
};
