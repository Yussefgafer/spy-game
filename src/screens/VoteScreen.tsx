import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LiquidCard } from '../components/LiquidCard';

interface VoteScreenProps {
  players: string[];
  spies: string[];
  onVoteComplete: (correctVoters: string[]) => void;
}

export const VoteScreen: React.FC<VoteScreenProps> = ({ players, spies, onVoteComplete }) => {
  const { colors } = useTheme();
  const [correctVoters, setCorrectVoters] = useState<string[]>([]);

  // استبعاد الجواسيس من التصويت
  const innocentPlayers = players.filter((p) => !spies.includes(p));

  const toggleVote = (player: string) => {
    if (correctVoters.includes(player)) {
      setCorrectVoters(correctVoters.filter((p) => p !== player));
    } else {
      setCorrectVoters([...correctVoters, player]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>من صوّت ضد الجاسوس؟ 🗳️</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        حدد اللاعبين الأبرياء الذين كشفوا الجاسوس الفعلي وصوتوا ضده بشكل صحيح:
      </Text>

      <ScrollView style={styles.scroll}>
        {innocentPlayers.map((player, index) => {
          const isSelected = correctVoters.includes(player);
          return (
            <Pressable key={index} onPress={() => toggleVote(player)}>
              <View
                style={[
                  styles.playerCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.playerText, { color: colors.text }]}>{player}</Text>
                <Text style={{ color: isSelected ? colors.accent : colors.textMuted }}>
                  {isSelected ? '✓ صوّت صح' : 'لم يصوّت'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable onPress={() => onVoteComplete(correctVoters)}>
        <LiquidCard style={[styles.btn, { backgroundColor: colors.accent }]}>
          <Text style={styles.btnText}>تأكيد التصويت والتالي ➡️</Text>
        </LiquidCard>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  scroll: { flex: 1, marginBottom: 20 },
  playerCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
    alignItems: 'center',
  },
  playerText: { fontSize: 16, fontWeight: '600' },
  btn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
