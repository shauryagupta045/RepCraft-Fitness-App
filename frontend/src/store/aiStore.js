import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAIChat, getAIChat } from '../services/userService';

/** Fire-and-forget Firebase write */
function fbWrite(fn, ...args) {
  fn(...args).catch((e) => console.warn('[aiStore] Firebase write failed:', e.message));
}

export const useAIStore = create(
  persist(
    (set, get) => ({
      chatHistory: [],
      isGenerating: false,
      lastPlan: null,
      insights: [],
      _uid: null,

      setUid: (uid) => set({ _uid: uid }),

      /** Load chat history from Firebase on login */
      loadFromFirebase: async (uid) => {
        try {
          const chatHistory = await getAIChat(uid);
          set({ chatHistory, _uid: uid });
        } catch (e) {
          console.warn('[aiStore] loadFromFirebase error:', e.message);
        }
      },

      /** Reset on logout */
      resetStore: () => set({ chatHistory: [], isGenerating: false, lastPlan: null, insights: [], _uid: null }),

      addMessage: (message) => {
        const newMsg = { ...message, id: `m${Date.now()}`, timestamp: new Date().toISOString() };
        set((state) => {
          const chatHistory = [...state.chatHistory, newMsg];
          const uid = state._uid;
          if (uid) fbWrite(saveAIChat, uid, chatHistory);
          return { chatHistory };
        });
      },

      setGenerating: (val) => set({ isGenerating: val }),

      setLastPlan: (plan) => set({ lastPlan: plan }),

      setInsights: (insights) => set({ insights }),

      clearChat: () => {
        const welcomeMsg = {
          id: 'm_init',
          role: 'assistant',
          text: "Chat cleared! I'm ready to help you with your fitness journey. What would you like to work on?",
          timestamp: new Date().toISOString(),
        };
        set((state) => {
          const uid = state._uid;
          if (uid) fbWrite(saveAIChat, uid, [welcomeMsg]);
          return { chatHistory: [welcomeMsg] };
        });
      },

      getAPIMessages: () => {
        const { chatHistory } = get();
        return chatHistory
          .filter(
            (msg) =>
              !msg.text.includes('Connection error — please check your API key') &&
              !msg.text.includes('temporarily impaired') &&
              !msg.text.includes('I apologize')
          )
          .map((msg) => ({ role: msg.role, content: msg.text }));
      },
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
