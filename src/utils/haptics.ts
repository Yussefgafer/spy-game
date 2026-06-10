import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility for consistent touch feedback across the app
 */

// Light tap feedback - for button presses, card taps
export const hapticLight = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

// Success notification - for completed actions
export const hapticSuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

// Warning notification - for alerts
export const hapticWarning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

// Error notification - for failed actions
export const hapticError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};
