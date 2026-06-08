import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, Trophy, Users, Target, Crown, Medal, Award, Sparkles } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { getLeaderboard, Player } from '../database/sqlite';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { PopInView, SlideInBounceView, FloatingView, PulseView } from '../components/BouncyAnimations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const MEDAL_ICONS = [Crown, Medal, Award];

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
      <PopInView delay={50}>
        <View style={styles.header}>
          <BouncyBackButton onPress={() => navigation.goBack()} colors={colors} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>🏆 سجل الأبطال</Text>
          <View style={styles.backButton} />
        </View>
      </PopInView>

      {leaderboard.length === 0 ? (
        <PopInView delay={150}>
          <View style={styles.emptyContainer}>
            <FloatingView distance={8} duration={2500}>
              <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.accent}15` }]}>
                <Trophy size={48} color={colors.textMuted} />
              </View>
            </FloatingView>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>لا يوجد أبطال بعد</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              ابدأ لعب مباراتك الأولى! 🎮
            </Text>
          </View>
        </PopInView>
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

          {/* Stats */}
          <PopInView delay={300}>
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statItem}>
                <Users size={20} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>{leaderboard.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>لاعب</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Target size={20} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {leaderboard.reduce((sum, p) => sum + p.total_points, 0)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>نقطة</Text>
              </View>
            </View>
          </PopInView>

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

// Bouncy Back Button
interface BouncyBackButtonProps {
  onPress: () => void;
  colors: any;
}

const BouncyBackButton: React.FC<BouncyBackButtonProps> = ({ onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.85, tension: 400, friction: 10, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: -15, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { rotate: rotateAnim.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] }) },
      ],
    }}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={styles.backButton}>
        <ChevronRight size={28} color={colors.text} />
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Player Card
interface BouncyPlayerCardProps {
  player: Player;
  rank: number;
  colors: any;
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
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  podiumContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  podiumFirst: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 10,
  },
  podiumSecond: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  podiumThird: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumAvatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  podiumEmoji: {
    fontSize: 28,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  podiumPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  crownBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
  },
  crownText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsCard: {
    flexDirection: 'row-reverse',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statValue: {
    fontSize: 22,
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
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
});
