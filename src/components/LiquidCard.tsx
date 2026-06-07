import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LiquidGlassView } from '@callstack/liquid-glass';
import { useTheme } from '../context/ThemeContext';

interface LiquidCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  effect?: 'clear' | 'regular' | 'none';
}

export const LiquidCard: React.FC<LiquidCardProps> = ({
  children,
  style,
  effect = 'regular',
}) => {
  const { colors, glassScheme } = useTheme();

  return (
    <LiquidGlassView
      style={[
        styles.card,
        {
          borderColor: colors.border,
          backgroundColor: 'transparent',
        },
        style,
      ]}
      colorScheme={glassScheme}
      effect={effect}
    >
      {children}
    </LiquidGlassView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    overflow: 'hidden',
  },
});
