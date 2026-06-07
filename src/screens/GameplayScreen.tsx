import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LiquidCard } from '../components/LiquidCard';

interface GameplayScreenProps {
  players: string[];
  onEndQuestions: () => void;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({ players, onEndQuestions }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>مرحلة الأسئلة والشكوك 🕵️‍♂️</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        اسألوا بعضكم البعض بحرية لتكتشفوا العميل السري!
      </Text>

      <ScrollView style={styles.playersScroll} contentContainerStyle={styles.playersContainer}>
        <Text style={[styles.listHeader, { color: colors.text }]}>اللاعبون في الجولة الحالية:</Text>
        {players.map((player, index) => (
          <View key={index} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.playerText, { color: colors.text }]}>{player}</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable onPress={onEndQuestions}>
        <LiquidCard style={[styles.endBtn, { backgroundColor: colors.accent }]}>
          <Text style={styles.endBtnText}>انتهت الأسئلة / كشف الجاسوس 🚨</Text>
        </LiquidCard>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  playersScroll: { flex: 1, marginBottom: 20 },
  playersContainer: { gap: 10 },
  listHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  playerCard: { padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  playerText: { fontSize: 16, fontWeight: '600' },
  endBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  endBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});
