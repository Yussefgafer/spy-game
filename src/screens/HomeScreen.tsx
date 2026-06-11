import React, { useRef } from 'react';
import { StyleSheet, Text, View, Animated, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Play, Trophy, History, Settings } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { hapticSuccess } from '../utils/haptics';
import { PopInView } from '../components/BouncyAnimations';
import { useBouncyPress } from '../hooks/useBouncyPress';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const menuItems = [
    {
      label: 'لعب جديد',
      screen: 'Setup' as const,
      Icon: Play,
      color: '#10B981',
      emoji: '🎮',
    },
    {
      label: 'سجل الأبطال',
      screen: 'Leaderboard' as const,
      Icon: Trophy,
      color: '#F59E0B',
      emoji: '🏆',
    },
    {
      label: 'تاريخ المباريات',
      screen: 'History' as const,
      Icon: History,
      color: '#3B82F6',
      emoji: '📜',
    },
  ];

  const handlePress = (screen: 'Setup' | 'Leaderboard' | 'History') => {
    hapticSuccess();
    navigation.navigate(screen);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header without animations */}
      <View style={styles.header}>
        <PopInView delay={100}>
          <Text style={[styles.title, { color: colors.text }]}>🕵️ الجاسوس</Text>
        </PopInView>
        <PopInView delay={200}>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            من هو الجاسوس بينكم؟
          </Text>
        </PopInView>
      </View>

      {/* Menu Grid with staggered pop-in */}
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => {
          return (
            <PopInView key={index} delay={300 + index * 100}>
              <BouncyMenuCard
                item={item}
                colors={colors}
                onPress={() => handlePress(item.screen)}
              />
            </PopInView>
          );
        })}
      </View>

      {/* Settings Button - Fixed at bottom */}
      <PopInView delay={700}>
        <View
          style={[
            styles.footer,
            { borderTopColor: colors.border },
          ]}
        >
          <BouncySettingsButton
            colors={colors}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </PopInView>
    </View>
  );
};

// Separate component for menu card with its own animation state
interface BouncyMenuCardProps {
  item: {
    label: string;
    screen: 'Setup' | 'Leaderboard' | 'History';
    Icon: typeof Play;
    color: string;
    emoji: string;
  };
  colors: ThemeColors;
  onPress: () => void;
}

const BouncyMenuCard: React.FC<BouncyMenuCardProps> = ({ item, colors, onPress }) => {
  const { scaleAnim, rotateInterpolate, handlePressIn: bouncyHandlePressIn, handlePressOut: bouncyHandlePressOut } = useBouncyPress({
    pressInScale: 0.96,
    enableRotation: true,
    rotateInValue: 1,
    rotateInputRange: [0, 1],
    rotateOutputRange: ['0deg', '-1deg'],
  });
  const iconScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(iconScale, {
      toValue: 1.3,
      tension: 500,
      friction: 8,
      useNativeDriver: true,
    }).start();
    bouncyHandlePressIn();
  };

  const handlePressOut = () => {
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 400,
      friction: 8,
      useNativeDriver: true,
    }).start();
    bouncyHandlePressOut();
  };

  const IconComponent = item.Icon;

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateInterpolate!,
            },
          ],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityLabel={item.label}
        accessibilityRole="button"
        style={[
          styles.menuCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: `${item.color}20`, transform: [{ scale: iconScale }] },
          ]}
        >
          <IconComponent size={28} color={item.color} />
        </Animated.View>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
        <Text style={styles.menuEmoji}>{item.emoji}</Text>
      </Pressable>
    </Animated.View>
  );
};

// Settings button with bouncy animation
interface BouncySettingsButtonProps {
  colors: ThemeColors;
  onPress: () => void;
}

const BouncySettingsButton: React.FC<BouncySettingsButtonProps> = ({ colors, onPress }) => {
  const { scaleAnim, rotateInterpolate, handlePressIn, handlePressOut } = useBouncyPress({
    pressInScale: 0.95,
    enableRotation: true,
    rotateInValue: 1,
    rotateInputRange: [0, 1],
    rotateOutputRange: ['0deg', '10deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateInterpolate!,
            },
          ],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityLabel="الإعدادات"
        accessibilityRole="button"
        style={[
          styles.settingsButton,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Settings size={20} color={colors.textMuted} />
        <Text style={[styles.settingsLabel, { color: colors.textMuted }]}>الإعدادات</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  menuGrid: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  menuCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    lineHeight: 20,
  },
  menuEmoji: {
    fontSize: 28,
  },
  footer: {
    paddingVertical: 24,
    paddingTop: 28,
    borderTopWidth: 1.5,
  },
  settingsButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
