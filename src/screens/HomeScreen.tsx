import React, { useRef } from 'react';
import { StyleSheet, Text, View, Animated, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Play, Trophy, History, Settings } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { PopInView, FloatingView, PulseView } from '../components/BouncyAnimations';

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
      {/* Header with floating animation */}
      <FloatingView distance={6} duration={2500}>
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
      </FloatingView>

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
        <View style={styles.footer}>
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        tension: 400,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1.3,
        tension: 500,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 500,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 400,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const IconComponent = item.Icon;

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '-1deg'],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 400,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 500,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [
            { scale: scaleAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '10deg'],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.settingsButton,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <PulseView duration={2000} maxScale={1.1}>
          <Settings size={20} color={colors.textMuted} />
        </PulseView>
        <Text style={[styles.settingsLabel, { color: colors.textMuted }]}>الإعدادات</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  menuGrid: {
    flex: 1,
    gap: 16,
  },
  menuCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  menuEmoji: {
    fontSize: 24,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  settingsButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
