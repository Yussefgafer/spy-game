import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Timer, AlertTriangle, ArrowLeft, Zap, Eye, Sparkles } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../constants/words';
import { shuffleArray } from '../utils/shuffle';
import { hapticLight, hapticSuccess, hapticError, hapticWarning } from '../utils/haptics';
import { PopInView, SlideInBounceView } from '../components/BouncyAnimations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SpyGuessRouteProp = RouteProp<RootStackParamList, 'SpyGuess'>;

const TIMER_SECONDS = 60;

export const SpyGuessScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SpyGuessRouteProp>();
  const { categoryId, correctWord, players, spies, correctVoters } = route.params;

  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Get the category and random words for guessing
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;

    const otherWords = category.words.filter((w) => w !== correctWord);
    const randomWords = shuffleArray(otherWords).slice(0, 5);
    setShuffledWords(shuffleArray([...randomWords, correctWord]));

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - spy loses
          if (timerRef.current) clearInterval(timerRef.current);
          handleGuess(correctWord, true); // Wrong guess (timeout)
          return 0;
        }
        if (prev <= 10) {
          hapticWarning();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuess = (word: string, _isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const isCorrect = word === correctWord;
    
    if (isCorrect) {
      hapticSuccess();
    } else {
      hapticError();
    }

    // Navigate to results with all data
    navigation.navigate('Results', {
      players,
      spies,
      secretWord: correctWord,
      categoryName: CATEGORIES.find((c) => c.id === categoryId)?.name || '',
      categoryId,
      correctVoters,
      spyGuessedCorrectly: isCorrect,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft <= 15;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🕵️ فرصة الجاسوس الأخيرة</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            خمّن الكلمة السرية للفوز!
          </Text>
        </View>
      </PopInView>

      {/* Timer */}
      <PopInView delay={100}>
        <BouncyTimerCard
          timeLeft={timeLeft}
          isUrgent={isUrgent}
          formatTime={formatTime}
          colors={colors}
        />
      </PopInView>

      {/* Spy Info */}
      <PopInView delay={150}>
        <View style={[styles.spyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.spyIconContainer, { backgroundColor: `${colors.danger}15` }]}>
            <Eye size={24} color={colors.danger} />
          </View>
          <Text style={[styles.spyLabel, { color: colors.textMuted }]}>الجاسوس:</Text>
          <Text style={[styles.spyName, { color: colors.danger }]}>{spies.join('، ')}</Text>
        </View>
      </PopInView>

      {/* Word Options */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>اختر الكلمة السرية:</Text>
        {shuffledWords.map((word, index) => {
          const isSelected = selectedWord === word;
          return (
            <PopInView key={`${word}-${index}`} delay={200 + index * 50}>
              <BouncyWordOption
                word={word}
                selected={isSelected}
                onPress={() => {
                  hapticLight();
                  setSelectedWord(word);
                }}
                colors={colors}
              />
            </PopInView>
          );
        })}
      </ScrollView>

      {/* Confirm Button */}
      <SlideInBounceView delay={500}>
        <View style={styles.footer}>
          <BouncyConfirmButton
            selectedWord={selectedWord}
            onPress={() => selectedWord && handleGuess(selectedWord)}
            colors={colors}
          />
        </View>
      </SlideInBounceView>
    </View>
  );
};

// Bouncy Timer Card
interface BouncyTimerCardProps {
  timeLeft: number;
  isUrgent: boolean;
  formatTime: (seconds: number) => string;
  colors: ThemeColors;
}

const BouncyTimerCard: React.FC<BouncyTimerCardProps> = ({ timeLeft, isUrgent, formatTime, colors }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    let shakeLoop: Animated.CompositeAnimation | null = null;

    if (isUrgent) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.spring(pulseAnim, { toValue: 1.1, tension: 300, friction: 8, useNativeDriver: true }),
          Animated.spring(pulseAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();

      shakeLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ])
      );
      shakeLoop.start();
    }

    return () => {
      pulseLoop?.stop();
      shakeLoop?.stop();
    };
  }, [isUrgent]);

  return (
    <Animated.View style={[
      styles.timerCard,
      {
        backgroundColor: isUrgent ? colors.danger : colors.card,
        borderColor: isUrgent ? colors.danger : colors.border,
        transform: [
          { scale: pulseAnim },
          { translateX: shakeAnim.interpolate({ inputRange: [-2, 2], outputRange: [-4, 4] }) },
        ],
      },
    ]}>
      <Timer size={28} color={isUrgent ? '#FFF' : colors.accent} />
      <Text style={[styles.timerText, { color: isUrgent ? '#FFF' : colors.text }]}>
        {formatTime(timeLeft)}
      </Text>
      {isUrgent && (
        <View style={styles.urgentContainer}>
          <AlertTriangle size={18} color="#FFF" />
          <Text style={styles.urgentText}>أسرع!</Text>
        </View>
      )}
    </Animated.View>
  );
};

// Bouncy Word Option
interface BouncyWordOptionProps {
  word: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyWordOption: React.FC<BouncyWordOptionProps> = ({ word, selected, onPress, colors }) => {
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
          styles.wordOption,
          {
            backgroundColor: selected ? `${colors.accent}15` : colors.card,
            borderColor: selected ? colors.accent : colors.border,
          },
        ]}
      >
        <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
        {selected && (
          <Animated.View style={[styles.checkIcon, { transform: [{ scale: checkScale }] }]}>
            <Zap size={20} color={colors.accent} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Confirm Button
interface BouncyConfirmButtonProps {
  selectedWord: string | null;
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyConfirmButton: React.FC<BouncyConfirmButtonProps> = ({ selectedWord, onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!selectedWord) return;
    Animated.spring(scaleAnim, { toValue: 0.94, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={!selectedWord}
        style={[
          styles.confirmButton,
          {
            backgroundColor: selectedWord ? colors.accent : colors.card,
            borderColor: colors.border,
            opacity: selectedWord ? 1 : 0.6,
          },
        ]}
      >
        {selectedWord && <Sparkles size={20} color="#000" />}
        <Text style={[styles.confirmButtonText, { color: selectedWord ? '#000' : colors.textMuted }]}>
          تأكيد الاختيار
        </Text>
        <ArrowLeft size={22} color={selectedWord ? '#000' : colors.textMuted} />
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
  timerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    gap: 14,
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  urgentContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  urgentText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spyCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  spyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spyLabel: {
    fontSize: 13,
  },
  spyName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
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
  wordOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 10,
  },
  footer: {
    padding: 16,
  },
  confirmButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
