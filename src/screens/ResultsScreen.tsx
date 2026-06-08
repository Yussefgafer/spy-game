import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Trophy, RefreshCw, Home, Target, Users, Eye, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { saveMatchResult } from '../database/sqlite';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

export const ResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultsRouteProp>();
  const { players, spies, secretWord, categoryName, correctVoters, spyGuessedCorrectly } = route.params;

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) return;
    
    // Save result with proper data
    const success = saveMatchResult(
      categoryName,
      secretWord,
      spies,
      spyGuessedCorrectly ? 'SPY' : 'PLAYERS',
      players.length * 10,
      players.map((name) => ({
        name,
        role: spies.includes(name) ? 'SPY' : 'PLAYER',
        votedCorrectly: correctVoters.includes(name),
        pointsGained: correctVoters.includes(name) ? 10 : 0,
      }))
    );
    if (success) setSaved(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spyWins = spyGuessedCorrectly;

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
            { backgroundColor: spyWins ? `${colors.danger}20` : `${colors.accent}20` },
          ]}
        >
          <Trophy size={48} color={spyWins ? colors.danger : colors.accent} />
          <Text style={[styles.winnerTitle, { color: spyWins ? colors.danger : colors.accent }]}>
            {spyWins ? 'فاز الجاسوس!' : 'فاز الأبرياء!'}
          </Text>
          <Text style={[styles.winnerSubtitle, { color: colors.textMuted }]}>
            {spyWins 
              ? 'اكتشف الجاسوس الكلمة السرية' 
              : 'تمكن الأبرياء من كشف الجاسوس'}
          </Text>
        </View>

        {/* Secret Word */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <Target size={20} color={colors.accent} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>الكلمة السرية</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.accent }]}>{secretWord || 'غير متوفرة'}</Text>
        </View>

        {/* Spies */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <Eye size={20} color={colors.danger} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>الجاسوس</Text>
          </View>
          <Text style={[styles.infoValue, { color: colors.danger }]}>{spies.length > 0 ? spies.join('، ') : 'غير متوفر'}</Text>
        </View>

        {/* Correct Voters */}
        {correctVoters.length > 0 && (
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoHeader}>
              <CheckCircle size={20} color={colors.accent} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>صوّتوا بشكل صحيح</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>{correctVoters.join('، ')}</Text>
            <Text style={[styles.pointsText, { color: colors.accent }]}>+10 نقاط لكل منهم</Text>
          </View>
        )}

        {/* All Players */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoHeader}>
            <Users size={20} color={colors.textMuted} />
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>اللاعبون ({players.length})</Text>
          </View>
          <View style={styles.playersList}>
            {players.map((player, index) => {
              const isSpy = spies.includes(player);
              const votedCorrectly = correctVoters.includes(player);
              return (
                <View key={index} style={styles.playerRow}>
                  <Text style={[styles.playerName, { color: colors.text }]}>{player}</Text>
                  <View style={styles.playerBadges}>
                    {isSpy && (
                      <View style={[styles.badge, { backgroundColor: `${colors.danger}20` }]}>
                        <Text style={[styles.badgeText, { color: colors.danger }]}>جاسوس</Text>
                      </View>
                    )}
                    {votedCorrectly && (
                      <View style={[styles.badge, { backgroundColor: `${colors.accent}20` }]}>
                        <Text style={[styles.badgeText, { color: colors.accent }]}>+10</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },
  winnerSubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  infoCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  playersList: {
    marginTop: 12,
  },
  playerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  playerName: {
    fontSize: 16,
  },
  playerBadges: {
    flexDirection: 'row-reverse',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
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
