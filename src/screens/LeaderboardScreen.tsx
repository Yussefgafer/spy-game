import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getLeaderboard, Player } from '../database/sqlite';
import { LiquidCard } from '../components/LiquidCard';
import { EmptyState } from '../components/EmptyState';

interface LeaderboardScreenProps {
  onBack: () => void;
  onStartGame?: () => void;
}

// Medal colors for top 3
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack, onStartGame }) => {
  const { colors } = useTheme();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  useEffect(() => {
    const data = getLeaderboard();
    setLeaderboard(data);
  }, []);

  const getRankStyle = (index: number) => {
    if (index < 3) {
      return {
        medalEmoji: MEDAL_EMOJIS[index],
        isTopThree: true,
      };
    }
    return {
      medalEmoji: null,
      isTopThree: false,
    };
  };

  const renderPlayerCard = useCallback(
    (player: Player, index: number) => {
      const { medalEmoji, isTopThree } = getRankStyle(index);

      return (
        <View
          key={player.id}
          style={[
            styles.playerCard,
            {
              backgroundColor: colors.card,
              borderColor: isTopThree ? MEDAL_COLORS[index] : colors.border,
              borderWidth: isTopThree ? 2 : 1,
              transform: [{ scale: index === 0 ? 1.02 : 1 }],
            },
          ]}
        >
          {/* Rank Badge */}
          <View style={styles.rankSection}>
            {medalEmoji ? (
              <Text style={styles.medalEmoji}>{medalEmoji}</Text>
            ) : (
              <View style={[styles.rankBadge, { backgroundColor: colors.accentMuted }]}>
                <Text style={[styles.rankText, { color: colors.accent }]}>{index + 1}</Text>
              </View>
            )}
          </View>

          {/* Player Info */}
          <View style={styles.playerInfo}>
            <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
            <View style={styles.statsRow}>
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                🎮 {player.matches_played}
              </Text>
              <Text style={[styles.statText, { color: colors.textMuted }]}>
                🕵️ {player.spy_wins}
              </Text>
            </View>
          </View>

          {/* Points */}
          <View style={styles.pointsSection}>
            <Text style={[styles.pointsValue, { color: colors.accent }]}>{player.total_points}</Text>
            <Text style={[styles.pointsLabel, { color: colors.textMuted }]}>نقطة</Text>
          </View>
        </View>
      );
    },
    [colors]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.accent }]}>🏆 سجل الأبطال</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          ترتيب اللاعبين حسب مجموع النقاط
        </Text>
      </View>

      {/* Content */}
      {leaderboard.length === 0 ? (
        <EmptyState
          emoji="🏆"
          title="لا يوجد أبطال بعد"
          message="ابدأ لعب مباراتك الأولى ليظهر اللاعبون هنا!"
          actionLabel={onStartGame ? '🎮 ابدأ اللعب' : undefined}
          onAction={onStartGame}
        />
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Summary */}
          <View style={[styles.statsSummary, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{leaderboard.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>لاعب</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {leaderboard.reduce((sum, p) => sum + p.total_points, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>نقطة إجمالي</Text>
            </View>
          </View>

          {/* Player List */}
          {leaderboard.map((player, index) => renderPlayerCard(player, index))}
        </ScrollView>
      )}

      {/* Back Button */}
      <View style={styles.footer}>
        <Pressable onPress={onBack} style={{ width: '100%' }}>
          <LiquidCard style={[styles.backBtn, { borderColor: colors.border }]}>
            <Text style={[styles.backBtnText, { color: colors.text }]}>🏠 رجوع للرئيسية</Text>
          </LiquidCard>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsSummary: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  playerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  rankSection: {
    width: 50,
    alignItems: 'center',
  },
  medalEmoji: {
    fontSize: 32,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: 'flex-end',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  statText: {
    fontSize: 13,
  },
  pointsSection: {
    alignItems: 'center',
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  backBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
