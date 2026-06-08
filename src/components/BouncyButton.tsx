import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  Animated,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';

// Spring configurations for fidget toy feel
const SPRING_CONFIG = {
  bouncy: { tension: 400, friction: 10, useNativeDriver: true },
  superBouncy: { tension: 600, friction: 8, useNativeDriver: true },
  squishy: { tension: 300, friction: 12, useNativeDriver: true },
  elastic: { tension: 800, friction: 15, useNativeDriver: true },
};

interface BouncyButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bouncyLevel?: 'bouncy' | 'superBouncy' | 'squishy' | 'elastic';
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const BouncyButton: React.FC<BouncyButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  size = 'md',
  bouncyLevel = 'bouncy',
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    
    // Squish effect - scale X and Y differently
    if (bouncyLevel === 'squishy') {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.92,
          ...SPRING_CONFIG.squishy,
        }),
      ]).start();
    } else {
      // Regular bounce effect
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.88,
          ...SPRING_CONFIG[ bouncyLevel === 'superBouncy' ? 'superBouncy' : 'bouncy'],
        }),
        Animated.spring(rotateAnim, {
          toValue: -2,
          ...SPRING_CONFIG.bouncy,
        }),
      ]).start();
    }
    hapticLight();
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    // Bounce back with extra bounce (overshoot)
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIG.superBouncy,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        ...SPRING_CONFIG.bouncy,
      }),
    ]).start();
  };

  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  // Get variant styles
  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return { bg: colors.accent, text: '#000' };
      case 'secondary':
        return { bg: colors.card, text: colors.text, border: colors.border };
      case 'outline':
        return { bg: 'transparent', text: colors.accent, border: colors.accent };
      case 'ghost':
        return { bg: 'transparent', text: colors.text };
      default:
        return { bg: colors.accent, text: '#000' };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: 12, fontSize: 14, borderRadius: 12, iconSize: 16 };
      case 'md':
        return { padding: 16, fontSize: 16, borderRadius: 14, iconSize: 20 };
      case 'lg':
        return { padding: 20, fontSize: 18, borderRadius: 16, iconSize: 24 };
      case 'xl':
        return { padding: 24, fontSize: 20, borderRadius: 20, iconSize: 28 };
      default:
        return { padding: 16, fontSize: 16, borderRadius: 14, iconSize: 20 };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { 
        rotate: rotateAnim.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-10deg', '10deg'],
        })
      },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: variantStyles.bg,
            borderWidth: variantStyles.border ? 2 : 0,
            borderColor: variantStyles.border,
            padding: sizeStyles.padding,
            borderRadius: sizeStyles.borderRadius,
            opacity: disabled ? 0.5 : 1,
          },
          fullWidth && { width: '100%' },
          style,
        ]}
      >
        {icon}
        <Text
          style={[
            styles.text,
            { color: variantStyles.text, fontSize: sizeStyles.fontSize },
            textStyle,
          ]}
        >
          {children}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Card Component
interface BouncyCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  wobbleOnPress?: boolean;
  scaleOnPress?: boolean;
}

export const BouncyCard: React.FC<BouncyCardProps> = ({
  children,
  onPress,
  style,
  wobbleOnPress = true,
  scaleOnPress = true,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: scaleOnPress ? 0.97 : 1,
        ...SPRING_CONFIG.bouncy,
      }),
      wobbleOnPress && Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0.5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
    ].filter(Boolean)).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIG.superBouncy,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        ...SPRING_CONFIG.bouncy,
      }),
    ]).start();
  };

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { 
        rotate: rotateAnim.interpolate({
          inputRange: [-5, 5],
          outputRange: ['-5deg', '5deg'],
        })
      },
    ],
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPressIn={onPress ? handlePressIn : undefined}
        onPressOut={onPress ? handlePressOut : undefined}
        onPress={onPress}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
          style,
        ]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Icon Button
interface BouncyIconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export const BouncyIconButton: React.FC<BouncyIconButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'primary',
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        ...SPRING_CONFIG.superBouncy,
      }),
      Animated.spring(rotateAnim, {
        toValue: 15,
        ...SPRING_CONFIG.bouncy,
      }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIG.superBouncy,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        ...SPRING_CONFIG.bouncy,
      }),
    ]).start();
  };

  const getSize = () => {
    switch (size) {
      case 'sm': return 36;
      case 'md': return 44;
      case 'lg': return 52;
      default: return 44;
    }
  };

  const getBg = () => {
    switch (variant) {
      case 'primary': return colors.accent;
      case 'secondary': return colors.card;
      case 'ghost': return 'transparent';
      default: return colors.accent;
    }
  };

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { 
        rotate: rotateAnim.interpolate({
          inputRange: [-30, 30],
          outputRange: ['-30deg', '30deg'],
        })
      },
    ],
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.iconButton,
          {
            width: getSize(),
            height: getSize(),
            borderRadius: getSize() / 2,
            backgroundColor: getBg(),
          },
          style,
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Counter Button (+/-)
interface BouncyCounterButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  color: string;
}

export const BouncyCounterButton: React.FC<BouncyCounterButtonProps> = ({
  icon,
  onPress,
  color,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.7,
      ...SPRING_CONFIG.elastic,
    }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      ...SPRING_CONFIG.superBouncy,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIG.bouncy,
      }).start();
    });
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.counterButton, { backgroundColor: `${color}20` }]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Chip (for categories, tags, etc.)
interface BouncyChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BouncyChip: React.FC<BouncyChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      ...SPRING_CONFIG.bouncy,
    }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      ...SPRING_CONFIG.superBouncy,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...SPRING_CONFIG.bouncy,
      }).start();
    });
  };

  // Shake animation when selected
  React.useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0.5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { 
        translateX: shakeAnim.interpolate({
          inputRange: [-2, 2],
          outputRange: [-4, 4],
        })
      },
    ],
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.accent : colors.card,
            borderColor: selected ? colors.accent : colors.border,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: selected ? '#000' : colors.text },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Player Item
interface BouncyPlayerItemProps {
  name: string;
  onRemove: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BouncyPlayerItem: React.FC<BouncyPlayerItemProps> = ({
  name,
  onRemove,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const removeAnim = useRef(new Animated.Value(1)).current;

  const handleRemove = () => {
    // Bounce then remove animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.05,
        ...SPRING_CONFIG.bouncy,
      }),
      Animated.parallel([
        Animated.timing(removeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onRemove();
    });
    hapticLight();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: removeAnim,
        },
        style,
      ]}
    >
      <Pressable
        style={[
          styles.playerItem,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.playerName, { color: colors.text }]}>{name}</Text>
        <Pressable onPress={handleRemove} style={styles.removeButton}>
          <Animated.View>
            {/* X icon will be replaced by lucide icon in parent */}
          </Animated.View>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
});
