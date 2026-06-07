import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LiquidCard } from '../components/LiquidCard';

interface HomeScreenProps {
  onNavigate: (screen: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { colors } = useTheme();

  const menuItems = [
    { label: '🎮 لعب جديد', screen: 'SETUP' },
    { label: '🏆 سجل الأبطال', screen: 'LEADERBOARD' },
    { label: '📜 تاريخ المباريات', screen: 'HISTORY' },
    { label: '⚙️ الإعدادات', screen: 'SETTINGS' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.accent }]}>🕵️‍♂️ الجاسوس</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        من هو الجاسوس بينكم؟
      </Text>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <Pressable key={index} onPress={() => onNavigate(item.screen)}>
            <LiquidCard style={styles.menuItem}>
              <Text style={[styles.menuText, { color: colors.text }]}>
                {item.label}
              </Text>
            </LiquidCard>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { fontSize: 48, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 40 },
  menu: { width: '100%', gap: 16 },
  menuItem: { height: 64, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 18, fontWeight: 'bold' },
});
