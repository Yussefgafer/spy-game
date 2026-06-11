import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, Users, Target, Crown, Sparkles } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { getLeaderboard, Player } from '../database/sqlite';
import { hapticLight } from '../utils/haptics';
import { PopInView, FloatingView, PulseView } from '../components/BouncyAnimations';
import { BouncyBackButton } from '../components/BouncyBackButton';
import { EmptyState, StatsCard } from '../components/SharedCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export const LeaderboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };
    load();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <BouncyBackButton onPress={() => navigation.goBack()} colors={colors} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>🏆 سجل الأبطال</Text>
          <View style={styles.backButton} />
        </View>
      </PopInView>

      {leaderboard.length === 0 ? (
        <EmptyState
          icon={<Trophy size={48} color={colors.textMuted} />}
          title="لا يوجد أبطال بعد"
          subtitle="ابدأ لعب مباراتك الأولى! 🎮"
        />
      ) : (
        <>
          {/* Top 3 Podium */}
          {leaderboard.length >= 1 && (
            <PopInView delay={100}>
              <View style={styles.podiumContainer}>
                {/* Second Place */}
                {leaderboard.length >= 2 && (
                  <PopInView delay={200}>
                    <View style={styles.podiumSecond}>
                      <View style={[styles.podiumAvatar, { backgroundColor: `${MEDAL_COLORS[1]}20` }]}>
                        <Text style={styles.podiumEmoji}>🥈</Text>
                      </View>
                      <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                        {leaderboard[1].name}
                      </Text>
                      <Text style={[styles.podiumPoints, { color: MEDAL_COLORS[1] }]}>
                        {leaderboard[1].total_points}
                      </Text>
                    </View>
                  </PopInView>
                )}
                
                {/* First Place */}
                <PopInView delay={150}>
                  <FloatingView distance={4} duration={2000}>
                    <View style={styles.podiumFirst}>
                      <PulseView maxScale={1.1} duration={1500}>
                        <View style={[styles.podiumAvatarLarge, { backgroundColor: `${MEDAL_COLORS[0]}20` }]}>
                          <Crown size={24} color={MEDAL_COLORS[0]} />
                        </View>
                      </PulseView>
                      <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                        {leaderboard[0].name}
                      </Text>
                      <Text style={[styles.podiumPoints, { color: MEDAL_COLORS[0] }]}>
                        {leaderboard[0].total_points}
                      </Text>
                      <View style={[styles.crownBadge, { backgroundColor: MEDAL_COLORS[0] }]}>
                        <Text style={styles.crownText}>👑 البطل</Text>
                      </View>
                    </View>
                  </FloatingView>
                </PopInView>

                {/* Third Place */}
                {leaderboard.length >= 3 && (
                  <PopInView delay={250}>
                    <View style={styles.podiumThird}>
                      <View style={[styles.podiumAvatar, { backgroundColor: `${MEDAL_COLORS[2]}20` }]}>
                        <Text style={styles.podiumEmoji}>🥉</Text>
                      </View>
                      <Text style={[styles.podiumName, { color: colors.text }]} numberOfLines={1}>
                        {leaderboard[2].name}
                      </Text>
                      <Text style={[styles.podiumPoints, { color: MEDAL_COLORS[2] }]}>
                        {leaderboard[2].total_points}
                      </Text>
                    </View>
                  </PopInView>
                )}
              </View>
            </PopInView>
          )}

          <StatsCard
            delay={300}
            items={[
              { icon: <Users size={20} color={colors.accent} />, value: String(leaderboard.length), label: 'لاعب' },
              { icon: <Target size={20} color={colors.accent} />, value: String(leaderboard.reduce((sum, p) => sum + p.total_points, 0)), label: 'نقطة' },
            ]}
          />

          {/* List */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {leaderboard.slice(3).map((player, index) => (
              <PopInView key={player.id} delay={350 + index * 50}>
                <BouncyPlayerCard
                  player={player}
                  rank={index + 4}
                  colors={colors}
                />
              </PopInView>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

// Bouncy Player Card
interface BouncyPlayerCardProps {
  player: Player;
  rank: number;
  colors: ThemeColors;
}

const BouncyPlayerCard: React.FC<BouncyPlayerCardProps> = ({ player, rank, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.rankSection}>
          <Text style={[styles.rankText, { color: colors.textMuted }]}>{rank}</Text>
        </View>
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
          <Text style={[styles.playerStats, { color: colors.textMuted }]}>
            {player.matches_played} مباراة
          </Text>
        </View>
        <View style={[styles.pointsBadge, { backgroundColor: `${colors.accent}15` }]}>
          <Sparkles size={14} color={colors.accent} />
          <Text style={[styles.points, { color: colors.accent }]}>{player.total_points}</Text>
        </View>
      </Pressable>
    </Animated.View>
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
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  podiumContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  podiumFirst: {
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 14,
  },
  podiumSecond: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  podiumThird: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  podiumAvatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  podiumEmoji: {
    fontSize: 32,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  podiumPoints: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  crownBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 10,
  },
  crownText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  rankSection: {
    width: 36,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
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
  pointsBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  points: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
