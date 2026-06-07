import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HowToPlayModal } from '../components/HowToPlayModal';
import { hapticLight, hapticSelection } from '../utils/haptics';

type ScreenType =
  | 'HOME'
  | 'SETUP'
  | 'REVEAL'
  | 'GAMEPLAY'
  | 'VOTE'
  | 'SPY_GUESS'
  | 'RESULTS'
  | 'LEADERBOARD'
  | 'HISTORY'
  | 'SETTINGS';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { colors } = useTheme();
  const [showTutorial, setShowTutorial] = useState(false);

  const menuItems: { label: string; screen: ScreenType; emoji: string }[] = [
    { label: 'لعب جديد', screen: 'SETUP', emoji: '🎮' },
    { label: 'سجل الأبطال', screen: 'LEADERBOARD', emoji: '🏆' },
    { label: 'تاريخ المباريات', screen: 'HISTORY', emoji: '📜' },
    { label: 'الإعدادات', screen: 'SETTINGS', emoji: '⚙️' },
  ];

  const handleNavigate = (screen: ScreenType) => {
    hapticLight();
    onNavigate(screen);
  };

  const handleTutorialOpen = () => {
    hapticSelection();
    setShowTutorial(true);
  };

  const MenuItem: React.FC<{ item: { label: string; screen: ScreenType; emoji: string } }> = ({
    item,
  }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPress={() => handleNavigate(item.screen)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: '100%' }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.menuEmoji}>{item.emoji}</Text>
            <Text style={[styles.menuText, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.menuArrow, { color: colors.textMuted }]}>←</Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={[styles.logoCircle, { backgroundColor: colors.accentMuted }]}>
          <Text style={styles.logoEmoji}>🕵️‍♂️</Text>
        </View>
        <Text style={[styles.logo, { color: colors.accent }]}>الجاسوس</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          من هو الجاسوس بينكم؟
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </View>

      {/* Help Button */}
      <Pressable onPress={handleTutorialOpen} style={styles.helpButton}>
        <View style={[styles.helpButtonContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.helpEmoji}>❓</Text>
          <Text style={[styles.helpText, { color: colors.textMuted }]}>كيف تلعب؟</Text>
        </View>
      </Pressable>

      {/* Tutorial Modal */}
      <HowToPlayModal visible={showTutorial} onClose={() => setShowTutorial(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 50,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  menu: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
  },
  menuEmoji: {
    fontSize: 24,
    marginLeft: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'right',
  },
  menuArrow: {
    fontSize: 20,
  },
  helpButton: {
    width: '100%',
  },
  helpButtonContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  helpEmoji: {
    fontSize: 18,
  },
  helpText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
