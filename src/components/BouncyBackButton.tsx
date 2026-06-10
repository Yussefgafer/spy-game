import React, { useRef } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { ThemeColors } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptics';

export interface BouncyBackButtonProps {
  onPress: () => void;
  colors: ThemeColors;
  /** الأيقونة المستخدمة - الافتراضي ChevronLeft (RTL: سهم يشير لليسار) */
  icon?: 'chevronRight' | 'chevronLeft';
}

export const BouncyBackButton: React.FC<BouncyBackButtonProps> = ({
  onPress,
  colors,
  icon = 'chevronLeft',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.85, tension: 400, friction: 10, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: -15, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const IconComponent = icon === 'chevronRight' ? ChevronRight : ChevronLeft;

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { rotate: rotateAnim.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] }) },
      ],
    }}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={styles.backButton}>
        <IconComponent size={28} color={colors.text} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
