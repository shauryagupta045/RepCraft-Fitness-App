import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_AI_CHAT } from '../constants/mockData';

export const useAIStore = create(
  persist(
    (set, get) => ({
      chatHistory: MOCK_AI_CHAT,
      isGenerating: false,
      lastPlan: null,
      insights: [],

      addMessage: (message) =>
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            { ...message, id: `m${Date.now()}`, timestamp: new Date().toISOString() },
          ],
        })),

      setGenerating: (val) => set({ isGenerating: val }),

      setLastPlan: (plan) => set({ lastPlan: plan }),

      setInsights: (insights) => set({ insights }),

      clearChat: () =>
        set({
          chatHistory: [
            {
              id: 'm_init',
              role: 'assistant',
              text: "Chat cleared! I'm ready to help you with your fitness journey. What would you like to work on?",
              timestamp: new Date().toISOString(),
            },
          ],
        }),

      getAPIMessages: () => {
        const { chatHistory } = get();
        return chatHistory
          .filter(msg => 
            !msg.text.includes("Connection error — please check your API key") && 
            !msg.text.includes("temporarily impaired") &&
            !msg.text.includes("I apologize")
          )
          .map((msg) => ({
            role: msg.role,
            content: msg.text,
          }));
      },
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
