import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getHistory, Match } from '../database/sqlite';
import { LiquidCard } from '../components/LiquidCard';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const [history, setHistory] = useState<Match[]>([]);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);

  useEffect(() => {
    const data = getHistory();
    setHistory(data);
  }, []);

  // دالة تنسيق التاريخ والوقت باللغة العربية بالكامل
  const formatArabicDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } catch (e) {
      return isoString;
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.accent }]}>📜 تاريخ المباريات</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        سجل بكافة الجولات التي لعبتموها وتفاصيل الفوز والنقاط:
      </Text>

      <ScrollView style={styles.scroll}>
        {history.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>لا يوجد مباريات مسجلة بعد.</Text>
        ) : (
          history.map((match) => {
            const isExpanded = expandedMatchId === match.id;
            return (
              <Pressable key={match.id} onPress={() => toggleExpand(match.id)}>
                <LiquidCard style={[styles.matchCard, isExpanded && { borderColor: colors.accent }]}>
                  <View style={styles.matchHeader}>
                    <Text style={[styles.matchDate, { color: colors.textMuted }]}>
                      {formatArabicDate(match.date)}
                    </Text>
                    <Text style={[styles.matchWord, { color: colors.text }]}>
                      الكلمة: <Text style={{ color: colors.accent }}>{match.secret_word}</Text>
                    </Text>
                  </View>

                  <View style={styles.matchSummary}>
                    <Text style={{ color: colors.text }}>
                      الفائز: {match.winner === 'SPY' ? (
                        <Text style={{ color: colors.danger }}>الجاسوس 🕵️‍♂️</Text>
                      ) : (
                        <Text style={{ color: colors.accent }}>الأبرياء 🛡️</Text>
                      )}
                    </Text>
                    <Text style={{ color: colors.textMuted }}>اضغط للتفاصيل {isExpanded ? '▲' : '▼'}</Text>
                  </View>

                  {isExpanded && match.details && (
                    <View style={[styles.detailsContainer, { borderTopColor: colors.border }]}>
                      <Text style={[styles.detailsTitle, { color: colors.text }]}>تفاصيل اللاعبين:</Text>
                      {match.details.map((detail, index) => (
                        <View key={index} style={styles.detailRow}>
                          <Text style={[styles.detailName, { color: colors.text }]}>{detail.player_name}</Text>
                          <Text style={{ color: detail.role === 'SPY' ? colors.danger : colors.textMuted }}>
                            {detail.role === 'SPY' ? 'جاسوس' : 'بريء'}
                          </Text>
                          <Text style={{ color: colors.accent }}>+{detail.points_gained} ن</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </LiquidCard>
              </Pressable>
            );
          })
        )}
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
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  matchCard: { marginBottom: 12, gap: 10 },
  matchHeader: { alignItems: 'flex-end', gap: 4 },
  matchDate: { fontSize: 12 },
  matchWord: { fontSize: 16, fontWeight: 'bold' },
  matchSummary: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 8 },
  detailsContainer: { borderTopWidth: 1, paddingTop: 12, marginTop: 8, gap: 8 },
  detailsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' },
  detailRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 4 },
  detailName: { fontSize: 14, fontWeight: '600' },
  backBtn: { height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  backBtnText: { fontSize: 16, fontWeight: 'bold' },
});
