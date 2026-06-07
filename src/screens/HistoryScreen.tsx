import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getHistory, Match } from '../database/sqlite';
import { LiquidCard } from '../components/LiquidCard';
import { EmptyState } from '../components/EmptyState';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface HistoryScreenProps {
  onBack: () => void;
  onStartGame?: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onStartGame }) => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<Match[]>([]);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  useEffect(() => {
    const data = getHistory();
    setHistory(data);
  }, []);

  const formatArabicDate = (isoString: string): { full: string; relative: string } => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let relative = '';
      if (diffDays === 0) {
        relative = 'اليوم';
      } else if (diffDays === 1) {
        relative = 'أمس';
      } else if (diffDays < 7) {
        relative = `منذ ${diffDays} أيام`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        relative = weeks === 1 ? 'منذ أسبوع' : `منذ ${weeks} أسابيع`;
      } else {
        relative = `منذ ${Math.floor(diffDays / 30)} شهر`;
      }

      const full = new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);

      return { full, relative };
    } catch {
      return { full: isoString, relative: isoString };
    }
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const renderMatchCard = (match: Match) => {
    const isExpanded = expandedMatchId === match.id;
    const { full, relative } = formatArabicDate(match.date);
    const isSpyWin = match.winner === 'SPY';

    return (
      <Pressable
        key={match.id}
        onPress={() => toggleExpand(match.id)}
        style={{ width: '100%' }}
      >
        <View
          style={[
            styles.matchCard,
            {
              backgroundColor: colors.card,
              borderColor: isExpanded ? colors.accent : colors.border,
            },
          ]}
        >
          {/* Match Header */}
          <View style={styles.matchHeader}>
            <View style={styles.matchTitleRow}>
              <View style={[styles.winnerBadge, { backgroundColor: isSpyWin ? 'rgba(255, 51, 102, 0.15)' : colors.accentMuted }]}>
                <Text style={styles.winnerEmoji}>{isSpyWin ? '🕵️‍♂️' : '🛡️'}</Text>
              </View>
              <View style={styles.matchInfo}>
                <Text style={[styles.secretWord, { color: colors.text }]}>
                  <Text style={{ color: colors.accent }}>{match.secret_word}</Text>
                </Text>
                <Text style={[styles.dateText, { color: colors.textMuted }]}>
                  {relative}
                </Text>
              </View>
              <View style={[styles.expandIcon, { backgroundColor: colors.accentMuted }]}>
                <Text style={styles.expandText}>{isExpanded ? '▲' : '▼'}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: colors.accent }]}>{match.points_pool}</Text>
              <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>نقطة</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={[styles.quickStatValue, { color: isSpyWin ? colors.danger : colors.accent }]}>
                {isSpyWin ? 'الجاسوس' : 'الأبرياء'}
              </Text>
              <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>الفائز</Text>
            </View>
          </View>

          {/* Expanded Details */}
          {isExpanded && match.details && (
            <View style={[styles.detailsContainer, { borderTopColor: colors.border }]}>
              <Text style={[styles.detailsTitle, { color: colors.text }]}>
                👥 تفاصيل اللاعبين
              </Text>
              {match.details.map((detail, index) => {
                const isSpy = detail.role === 'SPY';
                return (
                  <View
                    key={index}
                    style={[styles.detailRow, { backgroundColor: colors.background }]}
                  >
                    <View style={styles.detailInfo}>
                      <Text style={[styles.detailName, { color: colors.text }]}>
                        {detail.player_name}
                      </Text>
                      <View style={[styles.roleBadge, { backgroundColor: isSpy ? 'rgba(255, 51, 102, 0.15)' : colors.accentMuted }]}>
                        <Text style={[styles.roleText, { color: isSpy ? colors.danger : colors.accent }]}>
                          {isSpy ? '🕵️ جاسوس' : '👤 بريء'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.detailPoints}>
                      <Text style={[styles.pointsGained, { color: colors.accent }]}>
                        +{detail.points_gained}
                      </Text>
                      <Text style={[styles.pointsLabel, { color: colors.textMuted }]}>نقطة</Text>
                    </View>
                  </View>
                );
              })}
              <Text style={[styles.fullDateText, { color: colors.textMuted }]}>
                📅 {full}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  // Calculate stats
  const totalMatches = history.length;
  const spyWins = history.filter((m) => m.winner === 'SPY').length;
  const playerWins = totalMatches - spyWins;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.accent }]}>📜 تاريخ المباريات</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          سجل جميع الجولات السابقة
        </Text>
      </View>

      {/* Content */}
      {history.length === 0 ? (
        <EmptyState
          emoji="📜"
          title="لا توجد مباريات"
          message="ابدأ أول مباراة لك لتظهر هنا!"
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
              <Text style={[styles.statValue, { color: colors.accent }]}>{totalMatches}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>مباراة</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.danger }]}>{spyWins}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>فوز جاسوس</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.accent }]}>{playerWins}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>فوز أبرياء</Text>
            </View>
          </View>

          {/* Match List */}
          {history.map((match) => renderMatchCard(match))}
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
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  statItem: {
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
  matchCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  matchHeader: {
    padding: 16,
  },
  matchTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  winnerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winnerEmoji: {
    fontSize: 22,
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
    alignItems: 'flex-end',
  },
  secretWord: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 13,
    marginTop: 4,
  },
  expandIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandText: {
    fontSize: 12,
  },
  quickStats: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  detailsContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  detailInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  detailName: {
    fontSize: 15,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailPoints: {
    alignItems: 'center',
  },
  pointsGained: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 10,
  },
  fullDateText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
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
