import * as Location from 'expo-location';

/**
 * Service to handle GPS location tracking and route recording.
 */
export const LocationService = {
  /**
   * Requests location permissions.
   */
  requestPermissions: async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') return false;

      // Optional: Request background permissions for real tracking
      // const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      // return backgroundStatus === 'granted';

      return true;
    } catch (error) {
      console.error('Location permission request failed:', error);
      return false;
    }
  },

  /**
   * Starts tracking current position.
   */
  watchPosition: async (callback) => {
    try {
      const hasPermission = await LocationService.requestPermissions();
      if (!hasPermission) return null;

      return await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // every 5 seconds
          distanceInterval: 10, // every 10 meters
        },
        (location) => {
          if (callback) callback(location.coords);
        }
      );
    } catch (error) {
      console.error('Failed to start location watch:', error);
      return null;
    }
  },

  /**
   * Calculates distance between two coordinates in kilometers.
   */
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
