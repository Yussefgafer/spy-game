import React from 'react';
import { StyleSheet, Text, Pressable, Animated } from 'react-native';
import { Sparkles, Play } from 'lucide-react-native';
import type { ThemeColors } from '../context/ThemeContext';
import { useBouncyPress } from '../hooks/useBouncyPress';

interface BouncyButtonProps {
  onPress: () => void;
  colors: ThemeColors;
  label: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const BouncyButton: React.FC<BouncyButtonProps> = ({
  onPress,
  colors,
  label,
  icon,
  variant = 'primary',
  disabled = false,
}) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useBouncyPress({ disabled });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={[
          variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
          variant === 'primary'
            ? { backgroundColor: colors.accent }
            : { borderColor: colors.border },
        ]}
      >
        {variant === 'primary' && <Sparkles size={20} color="#000" />}
        {icon}
        <Text
          style={[
            variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText,
            { color: variant === 'primary' ? '#000' : colors.text },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ----- Bouncy Start Button (SetupScreen) -----
interface BouncyStartButtonProps {
  onPress: () => void;
  disabled: boolean;
  colors: ThemeColors;
}

export const BouncyStartButton: React.FC<BouncyStartButtonProps> = ({
  onPress,
  disabled,
  colors,
}) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useBouncyPress({ disabled });
  const canStart = !disabled;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.startButton,
          {
            backgroundColor: canStart ? colors.accent : colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {canStart && <Sparkles size={20} color="#000" />}
        <Play size={20} color={canStart ? '#000' : colors.textMuted} />
        <Text
          style={[
            styles.startButtonText,
            { color: canStart ? '#000' : colors.textMuted },
          ]}
        >
          ابدأ اللعب!
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  secondaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
  startButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
