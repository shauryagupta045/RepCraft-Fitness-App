// RepCraft AI Coach Service
// Replace ANTHROPIC_API_KEY with your actual key from https://console.anthropic.com

const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';

export const sendMessageToClaude = async (messages, userContext) => {
  const systemPrompt = `You are RepCraft AI Coach, a personal fitness assistant.

User Profile:
- Name: ${userContext.name}
- Goal: ${userContext.goal}
- Experience: ${userContext.level}
- Current streak: ${userContext.streak} days

Instructions:
- When generating a workout plan, return JSON with key "workoutPlan" — an array of day objects with: title, day, muscleGroup, exercises (array of: name, sets, reps, weight, rest)
- When generating diet targets, return JSON with key "dietPlan" containing: calories, protein, fat, carbs, and a brief description why this plan fits the user's goal.
- When generating insights, return JSON array with key "insights" — each: icon, title, stat, description, action, color
- For workout optimization, return JSON with key "suggestions" — each: icon, title, description, impact
- Be concise, encouraging, and mobile-friendly in all responses
- Keep plain text responses under 120 words
- Always be supportive and science-based

Current metrics:
${JSON.stringify(userContext.metrics, null, 2)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0]?.text || '';

    let parsedPlan = null;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedPlan = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Not JSON — plain text response
    }

    return { text, parsedPlan };
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
};

export const generateWorkoutPlan = async (params, userContext) => {
  const prompt = `Generate a ${params.daysPerWeek}-day/week workout plan for a ${params.experience} level athlete with goal: ${params.goal}. 
Available equipment: ${params.equipment.join(', ')}.
Return ONLY a JSON object with key "workoutPlan" containing an array of day objects.
Each day: { title, day, muscleGroup, exercises: [{ name, sets, reps, weight, rest }] }`;

  return sendMessageToClaude([{ role: 'user', content: prompt }], userContext);
};

export const generateDietPlan = async (params, userContext) => {
  const tdee = Math.round(
    (10 * params.weight + 6.25 * params.height - 5 * params.age + 5) * 1.55
  );
  const calAdjust = params.goal === 'Cut' ? -400 : params.goal === 'Bulk' ? +400 : 0;

  const prompt = `Generate macro targets for:
- Weight: ${params.weight}kg, Height: ${params.height}cm, Age: ${params.age}
- Goal: ${params.goal} (${calAdjust > 0 ? '+' : ''}${calAdjust} calories from TDEE ~${tdee})
- Preferences: ${params.preferences.join(', ') || 'None'}
Return ONLY a JSON object with key "dietPlan": { calories, protein, fat, carbs }`;

  return sendMessageToClaude([{ role: 'user', content: prompt }], userContext);
};

export const analyzeProgress = async (metricsData, userContext) => {
  const prompt = `Analyze this fitness data and return 4 insights as JSON:
${JSON.stringify(metricsData, null, 2)}
Return ONLY JSON: { "insights": [{ "icon": "ionicons-name", "title": "short title", "stat": "key stat", "description": "1 sentence", "action": "action label", "color": "#hexcolor" }] }`;

  return sendMessageToClaude([{ role: 'user', content: prompt }], userContext);
};

export const optimizeRoutine = async (routines, userContext) => {
  const prompt = `Review these workout routines and suggest 4 optimizations:
${JSON.stringify(routines.map((r) => ({ title: r.title, exercises: r.exercises.map((e) => e.name), muscleGroup: r.muscleGroup })), null, 2)}
Return ONLY JSON: { "suggestions": [{ "icon": "ionicons-name", "title": "short title", "description": "improvement suggestion", "impact": "High/Medium/Low" }] }`;

  return sendMessageToClaude([{ role: 'user', content: prompt }], userContext);
};
