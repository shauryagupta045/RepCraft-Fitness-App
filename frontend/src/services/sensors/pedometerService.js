import { Pedometer } from 'expo-sensors';

/**
 * Service to handle step counting using expo-sensors Pedometer.
 */
export const PedometerService = {
  /**
   * Checks if the pedometer is available on the device.
   */
  isAvailable: async () => {
    try {
      return await Pedometer.isAvailableAsync();
    } catch (error) {
      console.error('Pedometer availability check failed:', error);
      return false;
    }
  },

  /**
   * Requests activity permissions from the user.
   */
  requestPermissions: async () => {
    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Pedometer permission request failed:', error);
      return false;
    }
  },

  /**
   * Subscribes to real-time step count updates.
   * Note: The result.steps is the number of steps taken since the subscription started.
   */
  subscribe: (callback) => {
    return Pedometer.watchStepCount(result => {
      if (callback) callback(result.steps);
    });
  },

  /**
   * Gets the total step count for a specific time range.
   */
  getStepCount: async (start, end) => {
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps;
    } catch (error) {
      console.error('Failed to get step count for range:', error);
      return 0;
    }
  },

  /**
   * Gets steps taken today (from 00:00 until now).
   */
  getStepsToday: async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps;
    } catch (error) {
      console.error('Failed to get today\'s steps:', error);
      return 0;
    }
  }
};
