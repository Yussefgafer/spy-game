import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, RefreshCw, Home, Users, Target } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { saveMatchResult } from '../database/sqlite';
import { hapticSuccess } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

export const ResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultsRouteProp>();
  const { config, spies, secretWord, spyGuessedCorrectly } = route.params;

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) return;
    // Save result
    const success = saveMatchResult(
      config.category,
      secretWord,
      spies,
      spyGuessedCorrectly ? 'SPY' : 'PLAYERS',
      config.players.length * 10,
      config.players.map((name) => ({
        name,
        role: spies.includes(name) ? 'SPY' : 'PLAYER',
        votedCorrectly: false,
        pointsGained: 0,
      }))
    );
    if (success) setSaved(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>النتيجة</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Winner Card */}
        <View
          style={[
            styles.winnerCard,
            { backgroundColor: spyGuessedCorrectly ? `${colors.danger}20` : `${colors.accent}20` },
          ]}
        >
          <Trophy size={40} color={spyGuessedCorrectly ? colors.danger : colors.accent} />
          <Text style={[styles.winnerTitle, { color: spyGuessedCorrectly ? colors.danger : colors.accent }]}>
            {spyGuessedCorrectly ? 'فاز الجاسوس!' : 'فاز الأبرياء!'}
          </Text>
        </View>

        {/* Secret Word */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>الكلمة السرية</Text>
          <Text style={[styles.infoValue, { color: colors.accent }]}>{secretWord}</Text>
        </View>

        {/* Spies */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>الجاسوس</Text>
          <Text style={[styles.infoValue, { color: colors.danger }]}>{spies.join('، ')}</Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => navigation.popToTop()}
          style={[styles.primaryButton, { backgroundColor: colors.accent }]}
        >
          <RefreshCw size={20} color="#000" />
          <Text style={styles.primaryButtonText}>لعبة جديدة</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.popToTop()}
          style={[styles.secondaryButton, { borderColor: colors.border }]}
        >
          <Home size={20} color={colors.text} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>الرئيسية</Text>
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
    paddingTop: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  winnerCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  winnerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
