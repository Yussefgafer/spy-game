import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getLeaderboard, Player } from '../database/sqlite';
import { LiquidCard } from '../components/LiquidCard';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  useEffect(() => {
    const data = getLeaderboard();
    setLeaderboard(data);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.accent }]}>🏆 سجل الأبطال</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        ترتيب اللاعبين التراكمي حسب مجموع النقاط عبر كل المباريات:
      </Text>

      <ScrollView style={styles.scroll}>
        {leaderboard.map((player, index) => (
          <View key={player.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.rankContainer}>
              <Text style={[styles.rankText, { color: colors.accent }]}>#{index + 1}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
              <Text style={[styles.playerStats, { color: colors.textMuted }]}>
                لعب: {player.matches_played} | فوز كجاسوس: {player.spy_wins}
              </Text>
            </View>
            <Text style={[styles.points, { color: colors.accent }]}>{player.total_points} نقطة</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={onBack}>
        <LiquidCard style={[styles.backBtn, { borderColor: colors.border }]}>
          <Text style={[styles.backBtnText, { color: colors.text }]}>رجوع للرئيسية 🏠</Text>
        </LiquidCard>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  scroll: { flex: 1, marginBottom: 20 },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  rankContainer: { width: 40, alignItems: 'center' },
  rankText: { fontSize: 18, fontWeight: 'bold' },
  playerInfo: { flex: 1, marginRight: 12, alignItems: 'flex-end' },
  playerName: { fontSize: 16, fontWeight: 'bold' },
  playerStats: { fontSize: 12, marginTop: 4 },
  points: { fontSize: 16, fontWeight: 'bold' },
  backBtn: { height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  backBtnText: { fontSize: 16, fontWeight: 'bold' },
});
