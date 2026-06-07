import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { saveMatchResult } from '../database/sqlite';
import { LiquidCard } from '../components/LiquidCard';

interface ResultsScreenProps {
  config: {
    category: string;
    spyCount: number;
    players: string[];
  };
  spies: string[];
  secretWord: string;
  correctVoters: string[];
  spyGuessedCorrectly: boolean;
  onNewGame: () => void;
  onBackToHome: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  config,
  spies,
  secretWord,
  correctVoters,
  spyGuessedCorrectly,
  onNewGame,
  onBackToHome,
}) => {
  const { colors } = useTheme();
  const [resultsSaved, setResultsSaved] = useState(false);
  const [roundScores, setRoundScores] = useState<{ name: string; role: string; points: number }[]>([]);

  const totalPlayers = config.players.length;
  const totalPool = totalPlayers * 10;

  useEffect(() => {
    if (resultsSaved) return;

    const calculatedScores = config.players.map((player) => {
      const isSpy = spies.includes(player);
      let points = 0;

      if (spyGuessedCorrectly) {
        // الجاسوس خمن صح: الجاسوس يأخذ نصف الـ Pool، والباقي صفر
        if (isSpy) {
          points = totalPool / 2;
        }
      } else {
        // الجاسوس لم يخمن صح: يتم تقسيم الـ Pool على من صوتوا ضده بشكل صحيح
        if (!isSpy && correctVoters.includes(player)) {
          points = totalPool / correctVoters.length;
        }
      }

      return {
        name: player,
        role: isSpy ? 'SPY' : 'PLAYER',
        points: Math.round(points),
      };
    });

    setRoundScores(calculatedScores);

    // حفظ النتيجة في قاعدة البيانات SQLite
    const dbPlayersDetails = calculatedScores.map((p) => ({
      name: p.name,
      role: p.role as 'SPY' | 'PLAYER',
      votedCorrectly: !spies.includes(p.name) && correctVoters.includes(p.name),
      pointsGained: p.points,
    }));

    const success = saveMatchResult(
      config.category,
      secretWord,
      spies,
      spyGuessedCorrectly ? 'SPY' : 'PLAYERS',
      totalPool,
      dbPlayersDetails
    );

    if (success) {
      setResultsSaved(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsSaved]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.accent }]}>نتائج الجولة 🏆</Text>

      <LiquidCard style={styles.summaryCard}>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          الكلمة السرية: <Text style={{ color: colors.accent }}>{secretWord}</Text>
        </Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          الجاسوس: <Text style={{ color: colors.danger }}>{spies.join('، ')}</Text>
        </Text>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          الفائز: {spyGuessedCorrectly ? (
            <Text style={{ color: colors.danger }}>الجاسوس (خمن الكلمة صح) 🎉</Text>
          ) : (
            <Text style={{ color: colors.accent }}>الأبرياء (كشفوا الجاسوس) 🎉</Text>
          )}
        </Text>
      </LiquidCard>

      <Text style={[styles.listHeader, { color: colors.text }]}>نقاط اللاعبين في هذه الجولة:</Text>
      <ScrollView style={styles.scroll}>
        {roundScores.map((player, index) => (
          <View key={index} style={[styles.playerRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
            <Text style={{ color: player.role === 'SPY' ? colors.danger : colors.textMuted }}>
              {player.role === 'SPY' ? 'جاسوس' : 'بريء'}
            </Text>
            <Text style={[styles.playerPoints, { color: colors.accent }]}>+{player.points} نقطة</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.btnRow}>
        <Pressable onPress={onNewGame} style={{ flex: 1 }}>
          <LiquidCard style={[styles.btn, { backgroundColor: colors.accent }]}>
            <Text style={styles.btnText}>جولة جديدة 🎮</Text>
          </LiquidCard>
        </Pressable>
        <Pressable onPress={onBackToHome} style={{ flex: 1 }}>
          <LiquidCard style={[styles.btn, { borderColor: colors.border }]}>
            <Text style={[styles.btnText, { color: colors.text }]}>الرئيسية 🏠</Text>
          </LiquidCard>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  summaryCard: { marginBottom: 24, gap: 10 },
  summaryText: { fontSize: 16, fontWeight: '600' },
  listHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  scroll: { flex: 1, marginBottom: 20 },
  playerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  playerName: { fontSize: 16, fontWeight: '600' },
  playerPoints: { fontSize: 16, fontWeight: 'bold' },
  btnRow: { flexDirection: 'row-reverse', gap: 12, marginBottom: 20 },
  btn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
