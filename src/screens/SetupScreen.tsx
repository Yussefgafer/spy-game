import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AutoCompleteInput } from '../components/AutoCompleteInput';
import { CATEGORIES } from '../constants/words';
import { LiquidCard } from '../components/LiquidCard';

interface SetupScreenProps {
  onStartGame: (config: {
    category: string;
    spyCount: number;
    players: string[];
  }) => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartGame, onBack }) => {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [spyCount, setSpyCount] = useState(1);
  const [players, setPlayers] = useState<string[]>(['لاعب 1', 'لاعب 2', 'لاعب 3']);

  const handleAddPlayer = (name: string) => {
    if (players.includes(name)) return;
    setPlayers([...players, name]);
  };

  const handleRemovePlayer = (name: string) => {
    setPlayers(players.filter((p) => p !== name));
  };

  const handleStart = () => {
    if (players.length < 3) return; // الحد الأدنى 3 لاعبين
    onStartGame({ category: selectedCategory, spyCount, players });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>إعداد المباراة 🎮</Text>

      {/* اختيار التصنيف */}
      <Text style={[styles.label, { color: colors.text }]}>اختر التصنيف:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        {CATEGORIES.map((cat) => (
          <Pressable key={cat.id} onPress={() => setSelectedCategory(cat.id)}>
            <LiquidCard
              style={[
                styles.categoryCard,
                selectedCategory === cat.id && { borderColor: colors.accent },
              ]}
            >
              <Text style={{ color: selectedCategory === cat.id ? colors.accent : colors.text }}>
                {cat.name}
              </Text>
            </LiquidCard>
          </Pressable>
        ))}
      </ScrollView>

      {/* عدد الجواسيس */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>عدد الجواسيس:</Text>
        <View style={styles.counter}>
          <Pressable onPress={() => setSpyCount(Math.max(1, spyCount - 1))}>
            <Text style={[styles.counterBtn, { color: colors.accent }]}>-</Text>
          </Pressable>
          <Text style={[styles.counterVal, { color: colors.text }]}>{spyCount}</Text>
          <Pressable onPress={() => setSpyCount(Math.min(players.length - 1, spyCount + 1))}>
            <Text style={[styles.counterBtn, { color: colors.accent }]}>+</Text>
          </Pressable>
        </View>
      </View>

      {/* إضافة اللاعبين */}
      <Text style={[styles.label, { color: colors.text }]}>أضف اللاعبين:</Text>
      <AutoCompleteInput
        onPlayerSelect={(p) => handleAddPlayer(p.name)}
        onPlayerAdd={handleAddPlayer}
        activePlayers={players}
      />

      {/* قائمة اللاعبين المضافين حالياً */}
      <View style={styles.playersList}>
        {players.map((player, index) => (
          <View key={index} style={[styles.playerItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>{player}</Text>
            <Pressable onPress={() => handleRemovePlayer(player)}>
              <Text style={{ color: colors.danger, fontWeight: 'bold' }}>حذف</Text>
            </Pressable>
          </View>
        ))}
      </View>

      {/* أزرار التحكم */}
      <Pressable onPress={handleStart} disabled={players.length < 3}>
        <LiquidCard style={[styles.startBtn, { backgroundColor: players.length >= 3 ? colors.accent : colors.card }]}>
          <Text style={styles.startBtnText}>ابدأ اللعب 🚀</Text>
        </LiquidCard>
      </Pressable>

      <Pressable onPress={onBack} style={styles.backBtn}>
        <Text style={{ color: colors.textMuted }}>رجوع للرئيسية</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  categoriesRow: { flexDirection: 'row', marginBottom: 24 },
  categoryCard: { marginRight: 10, paddingHorizontal: 16, paddingVertical: 10 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 10 },
  counterVal: { fontSize: 18, fontWeight: 'bold' },
  playersList: { marginVertical: 20, gap: 10 },
  playerItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 14, borderRadius: 12, borderWidth: 1 },
  startBtn: { height: 56, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  startBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  backBtn: { alignItems: 'center', marginVertical: 24 },
});
