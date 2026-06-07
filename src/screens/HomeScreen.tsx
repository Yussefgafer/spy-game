import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Play, Trophy, History, Settings } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { hapticLight } from '../utils/haptics';

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
    },
    {
      label: 'سجل الأبطال',
      screen: 'Leaderboard' as const,
      Icon: Trophy,
      color: '#F59E0B',
    },
    {
      label: 'تاريخ المباريات',
      screen: 'History' as const,
      Icon: History,
      color: '#3B82F6',
    },
  ];

  const handlePress = (screen: 'Setup' | 'Leaderboard' | 'History') => {
    hapticLight();
    navigation.navigate(screen);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>الجاسوس</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          من هو الجاسوس بينكم؟
        </Text>
      </View>

      {/* Menu Grid */}
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => {
          const IconComponent = item.Icon;
          return (
            <Pressable
              key={index}
              onPress={() => handlePress(item.screen)}
              style={({ pressed }) => [
                styles.menuCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <IconComponent size={28} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Settings Button - Fixed at bottom */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => navigation.navigate('Settings')}
          style={({ pressed }) => [
            styles.settingsButton,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Settings size={20} color={colors.textMuted} />
          <Text style={[styles.settingsLabel, { color: colors.textMuted }]}>الإعدادات</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
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
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
