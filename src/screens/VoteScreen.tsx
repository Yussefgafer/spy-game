import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Check, ArrowLeft, MinusCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { hapticLight, hapticSuccess } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type VoteRouteProp = RouteProp<RootStackParamList, 'Vote'>;

export const VoteScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VoteRouteProp>();
  const { players, spies, secretWord, categoryId } = route.params;

  // All players vote (including spies can vote to confuse)
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [skippedVoters, setSkippedVoters] = useState<Set<string>>(new Set());

  const currentVoter = players[currentVoterIndex];
  const isLastVoter = currentVoterIndex === players.length - 1;
  const hasVoted = votes[currentVoter] !== undefined || skippedVoters.has(currentVoter);

  const handleVote = (suspectedSpy: string) => {
    hapticLight();
    setVotes({ ...votes, [currentVoter]: suspectedSpy });
    setSkippedVoters(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentVoter);
      return newSet;
    });
  };

  const handleSkip = () => {
    hapticLight();
    const newSkipped = new Set(skippedVoters);
    newSkipped.add(currentVoter);
    setSkippedVoters(newSkipped);
    // Remove any previous vote if exists
    const newVotes = { ...votes };
    delete newVotes[currentVoter];
    setVotes(newVotes);
  };

  const handleNext = () => {
    if (!hasVoted) return;

    hapticSuccess();

    if (isLastVoter) {
      // Calculate results - who voted for actual spies (excluding skipped voters)
      const correctVoters: string[] = [];
      Object.entries(votes).forEach(([voter, suspected]) => {
        if (spies.includes(suspected)) {
          correctVoters.push(voter);
        }
      });

      // Navigate to SpyGuess with all data
      navigation.navigate('SpyGuess', {
        categoryId,
        correctWord: secretWord,
        players,
        spies,
        correctVoters,
      });
    } else {
      setCurrentVoterIndex(currentVoterIndex + 1);
    }
  };

  const isSelected = (player: string) => votes[currentVoter] === player;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>مرحلة التصويت</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          مرر الهاتف لكل لاعب ليصوت سراً
        </Text>
      </View>

      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        {players.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index < currentVoterIndex
                  ? colors.accent
                  : index === currentVoterIndex
                    ? colors.accent
                    : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Current Voter */}
      <View style={styles.voterSection}>
        <View style={[styles.voterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <User size={32} color={colors.accent} />
          <Text style={[styles.voterName, { color: colors.text }]}>{currentVoter}</Text>
          <Text style={[styles.voterInstruction, { color: colors.textMuted }]}>
            اختر من تشك أنه الجاسوس
          </Text>
          <Text style={[styles.voterCounter, { color: colors.textMuted }]}>
            الناخب {currentVoterIndex + 1} من {players.length}
          </Text>
        </View>
      </View>

      {/* Voting Options */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>المشتبه بهم:</Text>
        
        {players
          .filter((p) => p !== currentVoter)
          .map((player) => (
            <Pressable
              key={player}
              onPress={() => handleVote(player)}
              style={[
                styles.playerOption,
                {
                  backgroundColor: isSelected(player) ? `${colors.accent}20` : colors.card,
                  borderColor: isSelected(player) ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.playerOptionText, { color: colors.text }]}>{player}</Text>
              {isSelected(player) && <Check size={20} color={colors.accent} />}
            </Pressable>
          ))}

        {/* Skip Vote Option */}
        <Pressable
          onPress={handleSkip}
          style={[
            styles.skipOption,
            {
              backgroundColor: skippedVoters.has(currentVoter) ? `${colors.textMuted}20` : colors.card,
              borderColor: skippedVoters.has(currentVoter) ? colors.textMuted : colors.border,
            },
          ]}
        >
          <MinusCircle size={20} color={colors.textMuted} />
          <Text style={[styles.skipText, { color: colors.textMuted }]}>
            أفضل عدم التصويت (لا تؤثر على نقاطك)
          </Text>
        </Pressable>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          disabled={!hasVoted}
          style={[
            styles.nextButton,
            {
              backgroundColor: hasVoted ? colors.accent : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.nextButtonText, { color: hasVoted ? '#000' : colors.textMuted }]}>
            {isLastVoter ? 'متابعة' : 'الناخب التالي'}
          </Text>
          <ArrowLeft size={20} color={hasVoted ? '#000' : colors.textMuted} />
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
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  voterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  voterCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  voterName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  voterInstruction: {
    fontSize: 14,
    marginTop: 8,
  },
  voterCounter: {
    fontSize: 12,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'right',
  },
  playerOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  playerOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  skipOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    gap: 8,
  },
  skipText: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
  },
  nextButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
});
