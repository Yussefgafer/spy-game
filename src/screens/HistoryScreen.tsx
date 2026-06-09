import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { History, ChevronDown, Trophy, Clock, Users } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { getHistory, Match } from '../database/sqlite';
import { hapticLight } from '../utils/haptics';
import { PopInView, FloatingView } from '../components/BouncyAnimations';
import { BouncyBackButton } from '../components/BouncyBackButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [history, setHistory] = useState<Match[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getHistory();
      setHistory(data);
    };
    load();
  }, []);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    if (diff < 7) return `منذ ${diff} أيام`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <BouncyBackButton onPress={() => navigation.goBack()} colors={colors} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>📜 تاريخ المباريات</Text>
          <View style={styles.backButton} />
        </View>
      </PopInView>

      {history.length === 0 ? (
        <PopInView delay={150}>
          <View style={styles.emptyContainer}>
            <FloatingView distance={8} duration={2500}>
              <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.accent}15` }]}>
                <History size={48} color={colors.textMuted} />
              </View>
            </FloatingView>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد مباريات</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              ابدأ أول مباراة لك! 🎮
            </Text>
          </View>
        </PopInView>
      ) : (
        <>
          {/* Stats */}
          <PopInView delay={100}>
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statItem}>
                <Trophy size={20} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>{history.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>مباراة</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Users size={20} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {history.filter(m => m.winner === 'PLAYERS').length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>فوز الأبرياء</Text>
              </View>
            </View>
          </PopInView>

          {/* List */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {history.map((match, index) => {
              const isExpanded = expandedId === match.id;
              const isSpyWin = match.winner === 'SPY';

              return (
                <PopInView key={match.id} delay={150 + index * 50}>
                  <BouncyMatchCard
                    match={match}
                    isExpanded={isExpanded}
                    isSpyWin={isSpyWin}
                    colors={colors}
                    formatDate={formatDate}
                    onPress={() => {
                      hapticLight();
                      setExpandedId(isExpanded ? null : match.id);
                    }}
                  />
                </PopInView>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
};

// Bouncy Match Card
interface BouncyMatchCardProps {
  match: Match;
  isExpanded: boolean;
  isSpyWin: boolean;
  colors: ThemeColors;
  formatDate: (iso: string) => string;
  onPress: () => void;
}

const BouncyMatchCard: React.FC<BouncyMatchCardProps> = ({ match, isExpanded, isSpyWin, colors, formatDate, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      tension: 300,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress} style={styles.matchHeader}>
          <View style={styles.matchInfo}>
            <View style={styles.wordRow}>
              <Text style={[styles.secretWord, { color: colors.text }]}>{match.secret_word}</Text>
              <View style={[styles.winnerBadge, { backgroundColor: isSpyWin ? `${colors.danger}20` : `${colors.accent}20` }]}>
                <Text style={[styles.winnerText, { color: isSpyWin ? colors.danger : colors.accent }]}>
                  {isSpyWin ? '🕵️ جاسوس' : '🎉 أبرياء'}
                </Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Clock size={14} color={colors.textMuted} />
              <Text style={[styles.matchDate, { color: colors.textMuted }]}>{formatDate(match.date)}</Text>
            </View>
          </View>
          <Animated.View style={{ transform: [{ rotate: expandAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }}>
            <ChevronDown size={22} color={colors.textMuted} />
          </Animated.View>
        </Pressable>

        {isExpanded && match.details && (
          <Animated.View style={[styles.detailsSection, { borderTopColor: colors.border, opacity: expandAnim }]}>
            {match.details.map((detail, index) => (
              <PopInView key={index} delay={index * 30}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailName, { color: colors.text }]}>{detail.player_name}</Text>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: detail.role === 'SPY' ? `${colors.danger}15` : `${colors.accent}15` }
                  ]}>
                    <Text style={[styles.detailRole, { color: detail.role === 'SPY' ? colors.danger : colors.accent }]}>
                      {detail.role === 'SPY' ? '🕵️ جاسوس' : '👤 بريء'}
                    </Text>
                  </View>
                </View>
              </PopInView>
            ))}
          </Animated.View>
        )}
      </View>
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
  statsCard: {
    flexDirection: 'row-reverse',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  statDivider: {
    width: 1.5,
    height: 48,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
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
  matchCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  matchHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  matchInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  wordRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  secretWord: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchDate: {
    fontSize: 13,
  },
  dateRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  matchStatus: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  winnerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  winnerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailsSection: {
    borderTopWidth: 1,
    padding: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailName: {
    fontSize: 15,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  detailRole: {
    fontSize: 12,
    fontWeight: '600',
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
