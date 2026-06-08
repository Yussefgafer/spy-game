import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Trophy, Users, Target } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { getLeaderboard, Player } from '../database/sqlite';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export const LeaderboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  useEffect(() => {
    const data = getLeaderboard();
    setLeaderboard(data);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronRight size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>سجل الأبطال</Text>
        <View style={styles.backButton} />
      </View>

      {leaderboard.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Trophy size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>لا يوجد أبطال بعد</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            ابدأ لعب مباراتك الأولى
          </Text>
        </View>
      ) : (
        <>
          {/* Stats */}
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Users size={18} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>{leaderboard.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>لاعب</Text>
            </View>
            <View style={styles.statItem}>
              <Target size={18} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {leaderboard.reduce((sum, p) => sum + p.total_points, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>نقطة</Text>
            </View>
          </View>

          {/* List */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {leaderboard.map((player, index) => {
              const isTopThree = index < 3;
              return (
                <View
                  key={player.id}
                  style={[
                    styles.playerCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isTopThree ? MEDAL_COLORS[index] : colors.border,
                    },
                  ]}
                >
                  <View style={styles.rankSection}>
                    {isTopThree ? (
                      <View style={[styles.medalBadge, { backgroundColor: `${MEDAL_COLORS[index]}20` }]}>
                        <Text style={[styles.medalText, { color: MEDAL_COLORS[index] }]}>{index + 1}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.rankText, { color: colors.textMuted }]}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
                    <Text style={[styles.playerStats, { color: colors.textMuted }]}>
                      {player.matches_played} مباراة
                    </Text>
                  </View>
                  <Text style={[styles.points, { color: colors.accent }]}>{player.total_points}</Text>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsCard: {
    flexDirection: 'row-reverse',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  playerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  rankSection: {
    width: 36,
    alignItems: 'center',
  },
  medalBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: 'flex-end',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerStats: {
    fontSize: 12,
    marginTop: 2,
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
