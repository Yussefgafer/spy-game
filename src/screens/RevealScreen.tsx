import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { HoldToReveal } from '../components/HoldToReveal';

interface RevealScreenProps {
  players: string[];
  spies: string[];
  secretWord: string;
  categoryName: string;
  onRevealComplete: () => void;
}

export const RevealScreen: React.FC<RevealScreenProps> = ({
  players,
  spies,
  secretWord,
  categoryName,
  onRevealComplete,
}) => {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentPlayer = players[currentIndex];
  const isSpy = spies.includes(currentPlayer);

  const handleNextPlayer = () => {
    if (currentIndex + 1 < players.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onRevealComplete();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.textMuted }]}>
        تمرير الهاتف وكشف الأدوار ({currentIndex + 1} / {players.length})
      </Text>

      <HoldToReveal
        playerName={currentPlayer}
        secretWord={secretWord}
        category={categoryName}
        isSpy={isSpy}
        onRevealComplete={handleNextPlayer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 14, marginBottom: 20 },
});
