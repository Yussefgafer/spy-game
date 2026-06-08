import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ArrowLeft, MinusCircle, Vote } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { PopInView, SlideInBounceView, PulseView, ShakeView } from '../components/BouncyAnimations';

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
      <PopInView delay={50}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🗳️ مرحلة التصويت</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            مرر الهاتف لكل لاعب ليصوت سراً
          </Text>
        </View>
      </PopInView>

      {/* Progress Dots with bounce */}
      <PopInView delay={100}>
        <View style={styles.progressContainer}>
          {players.map((_, index) => (
            <BouncyProgressDot
              key={index}
              index={index}
              currentIndex={currentVoterIndex}
              colors={colors}
            />
          ))}
        </View>
      </PopInView>

      {/* Current Voter */}
      <PopInView delay={150}>
        <View style={styles.voterSection}>
          <BouncyVoterCard
            voter={currentVoter}
            voterNumber={currentVoterIndex + 1}
            totalVoters={players.length}
            colors={colors}
          />
        </View>
      </PopInView>

      {/* Voting Options */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>المشتبه بهم:</Text>
        
        {players
          .filter((p) => p !== currentVoter)
          .map((player, index) => (
            <PopInView key={player} delay={200 + index * 50}>
              <BouncyVoteOption
                player={player}
                selected={isSelected(player)}
                onPress={() => handleVote(player)}
                colors={colors}
              />
            </PopInView>
          ))}

        {/* Skip Vote Option */}
        <PopInView delay={400}>
          <BouncySkipOption
            skipped={skippedVoters.has(currentVoter)}
            onPress={handleSkip}
            colors={colors}
          />
        </PopInView>
      </ScrollView>

      {/* Next Button */}
      <SlideInBounceView delay={450}>
        <View style={styles.footer}>
          <BouncyNextButton
            onPress={handleNext}
            disabled={!hasVoted}
            isLastVoter={isLastVoter}
            colors={colors}
          />
        </View>
      </SlideInBounceView>
    </View>
  );
};

// Bouncy Progress Dot
interface BouncyProgressDotProps {
  index: number;
  currentIndex: number;
  colors: ThemeColors;
}

const BouncyProgressDot: React.FC<BouncyProgressDotProps> = ({ index, currentIndex, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isPast = index < currentIndex;
  const isCurrent = index === currentIndex;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isCurrent) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.spring(scaleAnim, { toValue: 1.5, tension: 300, friction: 8, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
        ])
      );
      animation.start();
    } else {
      scaleAnim.setValue(1);
    }

    return () => {
      animation?.stop();
    };
  }, [isCurrent]);

  const getBgColor = () => {
    if (isPast) return colors.accent;
    if (isCurrent) return colors.accent;
    return colors.border;
  };

  return (
    <Animated.View
      style={[
        styles.progressDot,
        {
          backgroundColor: getBgColor(),
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
};

// Bouncy Voter Card
interface BouncyVoterCardProps {
  voter: string;
  voterNumber: number;
  totalVoters: number;
  colors: ThemeColors;
}

const BouncyVoterCard: React.FC<BouncyVoterCardProps> = ({ voter, voterNumber, totalVoters, colors }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 8, useNativeDriver: true }).start();
  }, [voter]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <View style={[styles.voterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PulseView maxScale={1.1} duration={1500}>
          <Vote size={36} color={colors.accent} />
        </PulseView>
        <Text style={[styles.voterName, { color: colors.text }]}>{voter}</Text>
        <Text style={[styles.voterInstruction, { color: colors.textMuted }]}>
          اختر من تشك أنه الجاسوس 🤔
        </Text>
        <Text style={[styles.voterCounter, { color: colors.accent }]}>
          الناخب {voterNumber} من {totalVoters}
        </Text>
      </View>
    </Animated.View>
  );
};

// Bouncy Vote Option
interface BouncyVoteOptionProps {
  player: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyVoteOption: React.FC<BouncyVoteOptionProps> = ({ player, selected, onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selected) {
      Animated.spring(checkScale, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
    } else {
      checkScale.setValue(0);
    }
  }, [selected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.playerOption,
          {
            backgroundColor: selected ? `${colors.accent}20` : colors.card,
            borderColor: selected ? colors.accent : colors.border,
          },
        ]}
      >
        <Text style={[styles.playerOptionText, { color: colors.text }]}>{player}</Text>
        {selected && (
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <Check size={22} color={colors.accent} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Skip Option
interface BouncySkipOptionProps {
  skipped: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

const BouncySkipOption: React.FC<BouncySkipOptionProps> = ({ skipped, onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.skipOption,
          {
            backgroundColor: skipped ? `${colors.textMuted}20` : colors.card,
            borderColor: skipped ? colors.textMuted : colors.border,
          },
        ]}
      >
        <MinusCircle size={22} color={colors.textMuted} />
        <Text style={[styles.skipText, { color: colors.textMuted }]}>
          أفضل عدم التصويت (لا تؤثر على نقاطك)
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Next Button
interface BouncyNextButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLastVoter: boolean;
  colors: ThemeColors;
}

const BouncyNextButton: React.FC<BouncyNextButtonProps> = ({ onPress, disabled, isLastVoter, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.94, tension: 400, friction: 10, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: -5, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { rotate: rotateAnim.interpolate({ inputRange: [-10, 10], outputRange: ['-10deg', '10deg'] }) },
      ],
      width: '100%',
    }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.nextButton,
          {
            backgroundColor: !disabled ? colors.accent : colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        <Text style={[styles.nextButtonText, { color: !disabled ? '#000' : colors.textMuted }]}>
          {isLastVoter ? 'متابعة' : 'الناخب التالي'}
        </Text>
        <ArrowLeft size={22} color={!disabled ? '#000' : colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  voterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  voterCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  voterName: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 14,
  },
  voterInstruction: {
    fontSize: 15,
    marginTop: 8,
  },
  voterCounter: {
    fontSize: 13,
    marginTop: 10,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'right',
    fontWeight: '500',
  },
  playerOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  playerOptionText: {
    fontSize: 17,
    fontWeight: '500',
  },
  skipOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 16,
    gap: 10,
  },
  skipText: {
    fontSize: 15,
  },
  footer: {
    padding: 16,
  },
  nextButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
