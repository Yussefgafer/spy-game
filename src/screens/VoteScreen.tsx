import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, BackHandler, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check, ArrowLeft, MinusCircle, Vote } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { PopInView, SlideInBounceView, PulseView } from '../components/BouncyAnimations';
import { useBouncyPress } from '../hooks/useBouncyPress';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type VoteRouteProp = RouteProp<RootStackParamList, 'Vote'>;

export const VoteScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VoteRouteProp>();
  const { players, spies, secretWord, categoryId, categoryName } = route.params;

  // اعتراض زر الرجوع — لا مغادرة أثناء التصويت بدون تأكيد
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'مغادرة التصويت',
          'هل تريد إلغاء جولة التصويت والعودة للقائمة الرئيسية؟',
          [
            { text: 'تراجع', style: 'cancel' },
            {
              text: 'خروج',
              style: 'destructive',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [navigation])
  );

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
      const innocentCount = players.length - spies.length;

      // الجواسيس يُستبعدون من correctVoters
      const correctVoters: string[] = [];
      Object.entries(votes).forEach(([voter, suspected]) => {
        if (spies.includes(suspected) && !spies.includes(voter)) {
          correctVoters.push(voter);
        }
      });

      const isUnanimous = correctVoters.length === innocentCount;

      if (isUnanimous) {
        // كل الأبرياء صوّتوا على الجاسوس → إجماع → نتائج مباشرة
        navigation.navigate('Results', {
          players,
          spies,
          secretWord,
          categoryName: categoryName || '',
          categoryId,
          correctVoters,
          winner: 'PLAYERS',
        });
      } else {
        // في واحد اختلف/تخطى → الجاسوس يحصل على فرصة التخمين
        navigation.navigate('SpyGuess', {
          players,
          spies,
          secretWord,
          categoryName: categoryName || '',
          categoryId,
          correctVoters,
        });
      }
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
  }, [isCurrent, scaleAnim]);

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
  }, [voter, scaleAnim]);

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
  const { scaleAnim, checkScale, handlePressIn, handlePressOut } = useBouncyPress({
    pressInScale: 0.95,
    enableCheckScale: true,
  });

  useEffect(() => {
    if (selected && checkScale) {
      Animated.spring(checkScale, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
    } else if (checkScale) {
      checkScale.setValue(0);
    }
  }, [selected, checkScale]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityLabel={`صوّت على ${player}`}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        style={[
          styles.playerOption,
          {
            backgroundColor: selected ? `${colors.accent}20` : colors.card,
            borderColor: selected ? colors.accent : colors.border,
          },
        ]}
      >
        <Text style={[styles.playerOptionText, { color: colors.text }]}>{player}</Text>
        {selected && checkScale && (
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
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        accessibilityLabel="أفضل عدم التصويت"
        accessibilityRole="radio"
        accessibilityState={{ selected: skipped }}
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
  const { scaleAnim, rotateInterpolate, handlePressIn, handlePressOut } = useBouncyPress({
    pressInScale: 0.94,
    enableRotation: true,
    rotateInValue: -5,
    disabled,
  });

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { rotate: rotateInterpolate! },
      ],
      width: '100%',
    }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={isLastVoter ? 'الانتقال لإظهار النتائج' : 'الانتقال للناخب التالي'}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
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
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  voterSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  voterCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  voterName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
    lineHeight: 26,
  },
  voterInstruction: {
    fontSize: 14,
    marginTop: 10,
    lineHeight: 20,
  },
  voterCounter: {
    fontSize: 12,
    marginTop: 12,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 14,
    textAlign: 'right',
    fontWeight: '700',
  },
  playerOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  playerOptionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  skipOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 12,
    gap: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  nextButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
