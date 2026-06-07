import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, History, Eye, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { getHistory, Match } from '../database/sqlite';
import { hapticLight } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [history, setHistory] = useState<Match[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const data = getHistory();
    setHistory(data);
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronRight size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>تاريخ المباريات</Text>
        <View style={styles.backButton} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <History size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد مباريات</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            ابدأ أول مباراة لك
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {history.map((match) => {
            const isExpanded = expandedId === match.id;
            const isSpyWin = match.winner === 'SPY';

            return (
              <View
                key={match.id}
                style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Pressable
                  onPress={() => {
                    hapticLight();
                    setExpandedId(isExpanded ? null : match.id);
                  }}
                  style={styles.matchHeader}
                >
                  <View style={styles.matchInfo}>
                    <Text style={[styles.secretWord, { color: colors.text }]}>{match.secret_word}</Text>
                    <Text style={[styles.matchDate, { color: colors.textMuted }]}>{formatDate(match.date)}</Text>
                  </View>
                  <View style={styles.matchStatus}>
                    <View style={[styles.winnerBadge, { backgroundColor: isSpyWin ? `${colors.danger}20` : `${colors.accent}20` }]}>
                      <Text style={[styles.winnerText, { color: isSpyWin ? colors.danger : colors.accent }]}>
                        {isSpyWin ? 'جاسوس' : 'أبرياء'}
                      </Text>
                    </View>
                    {isExpanded ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
                  </View>
                </Pressable>

                {isExpanded && match.details && (
                  <View style={[styles.detailsSection, { borderTopColor: colors.border }]}>
                    {match.details.map((detail, index) => (
                      <View key={index} style={styles.detailRow}>
                        <Text style={[styles.detailName, { color: colors.text }]}>{detail.player_name}</Text>
                        <Text style={[styles.detailRole, { color: detail.role === 'SPY' ? colors.danger : colors.textMuted }]}>
                          {detail.role === 'SPY' ? 'جاسوس' : 'بريء'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  matchCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  matchHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  matchInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  secretWord: {
    fontSize: 16,
    fontWeight: '600',
  },
  matchDate: {
    fontSize: 12,
    marginTop: 4,
  },
  matchStatus: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  winnerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  winnerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsSection: {
    borderTopWidth: 1,
    padding: 14,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailName: {
    fontSize: 14,
  },
  detailRole: {
    fontSize: 12,
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
