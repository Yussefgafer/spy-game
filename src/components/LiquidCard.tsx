import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface LiquidCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  effect?: 'clear' | 'regular' | 'none';
}

export const LiquidCard: React.FC<LiquidCardProps> = ({
  children,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.border,
          backgroundColor: colors.card, // استخدام لون الكارت المخصص للثيم
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    overflow: 'hidden',
    // تأثير ظل خفيف ليعطي عمق زجاجي (Glassmorphism Depth)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
