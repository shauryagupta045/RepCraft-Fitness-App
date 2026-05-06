import { GoogleGenAI } from "@google/genai";

// RepCraft AI Coach Service — Powered by Google Gemini
// Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) console.error('GEMINI KEY MISSING — check .env');
console.log('Gemini key loaded:', apiKey ? apiKey.substring(0, 8) + '...' : 'MISSING');

const ai = new GoogleGenAI({ apiKey });

/**
 * Core helper — calls the Gemini API via the official SDK with fallback logic.
 */
const callGeminiRaw = async (systemPrompt, history) => {
  try {
    return await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      contents: history,
    });
  } catch (err) {
    if (err.message?.includes('404') || err.message?.includes('model not found')) {
      console.warn('Falling back to gemini-2.0-flash');
      return await ai.models.generateContent({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt,
        contents: history,
      });
    }
    throw err;
  }
};

/* ─── System prompt builder ─────────────────────────────────────────────────── */
const buildSystemPrompt = (userContext) => `You are RepCraft AI Coach, a personal fitness assistant.

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

/* ─── Public API ─────────────────── */

export const sendMessageToGemini = async (messages, userContext) => {
  const systemPrompt = buildSystemPrompt(userContext);
  
  // Convert conversation history to Gemini format.
  const history = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || m.text || '' }],
  }));

  try {
    const response = await callGeminiRaw(systemPrompt, history);
    const text = response.text;

    // Attempt to extract a JSON payload embedded in the response
    let parsedPlan = null;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedPlan = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Plain-text response
    }

    return { text, parsedPlan };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

export const generateWorkoutPlan = async (params, userContext) => {
  const prompt = `Generate a ${params.daysPerWeek}-day/week workout plan for a ${params.experience} level athlete with goal: ${params.goal}. 
Available equipment: ${params.equipment.join(', ')}.
Return ONLY a JSON object with key "workoutPlan" containing an array of day objects.
Each day: { title, day, muscleGroup, exercises: [{ name, sets, reps, weight, rest }] }`;

  return sendMessageToGemini([{ role: 'user', content: prompt }], userContext);
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

  return sendMessageToGemini([{ role: 'user', content: prompt }], userContext);
};

export const analyzeProgress = async (metricsData, userContext) => {
  const prompt = `Analyze this fitness data and return 4 insights as JSON:
${JSON.stringify(metricsData, null, 2)}
Return ONLY JSON: { "insights": [{ "icon": "ionicons-name", "title": "short title", "stat": "key stat", "description": "1 sentence", "action": "action label", "color": "#hexcolor" }] }`;

  return sendMessageToGemini([{ role: 'user', content: prompt }], userContext);
};

export const optimizeRoutine = async (routines, userContext) => {
  const prompt = `Review these workout routines and suggest 4 optimizations:
${JSON.stringify(routines.map((r) => ({ title: r.title, exercises: r.exercises.map((e) => e.name), muscleGroup: r.muscleGroup })), null, 2)}
Return ONLY JSON: { "suggestions": [{ "icon": "ionicons-name", "title": "short title", "description": "improvement suggestion", "impact": "High/Medium/Low" }] }`;

  return sendMessageToGemini([{ role: 'user', content: prompt }], userContext);
};
