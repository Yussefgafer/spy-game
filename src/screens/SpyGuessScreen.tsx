import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Timer, AlertTriangle, ArrowLeft, Zap, Sparkles } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../constants/words';
import { SPY_GUESS_TIMER } from '../constants/animations';
import { shuffleArray } from '../utils/shuffle';
import { hapticSuccess, hapticError, hapticWarning, hapticLight } from '../utils/haptics';
import { PopInView, SlideInBounceView } from '../components/BouncyAnimations';
import { useBouncyPress } from '../hooks/useBouncyPress';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SpyGuessRouteProp = RouteProp<RootStackParamList, 'SpyGuess'>;

const TIMER_SECONDS = SPY_GUESS_TIMER;

export const SpyGuessScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SpyGuessRouteProp>();
  const { categoryId, secretWord, players, spies, categoryName, correctVoters } = route.params;

  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // تثبيت مرجع secretWord لتجنب stale closure في المؤقت
  const secretWordRef = useRef(secretWord);
  secretWordRef.current = secretWord;

  const handleGuess = useCallback((word: string, _isTimeout = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = word === secretWordRef.current;

    if (isCorrect) {
      hapticSuccess();
    } else {
      hapticError();
    }

    navigation.navigate('Results', {
      players,
      spies,
      secretWord: secretWordRef.current,
      categoryName: categoryName || '',
      categoryId,
      correctVoters,
      spyGuessedWord: isCorrect,
      winner: isCorrect ? 'SPY' : 'PLAYERS',
    });
  }, [navigation, players, spies, categoryName, categoryId, correctVoters]);

  // إعداد الكلمات وبدء المؤقت — مرة واحدة فقط عند التحميل
  // categoryId/secretWord ثابتة من route.params — لا تحتاج تغيير
  useEffect(() => {
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;

    const otherWords = category.words.filter((w) => w !== secretWord);
    const randomWords = shuffleArray(otherWords).slice(0, 5);
    setShuffledWords(shuffleArray([...randomWords, secretWord]));

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
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

  // مراقبة انتهاء الوقت — تستخدم handleGuess المثبت (useCallback + ref)
  useEffect(() => {
    if (timeLeft === 0 && !timedOut) {
      setTimedOut(true);
      handleGuess(secretWordRef.current, true);
    }
  }, [timeLeft, timedOut, handleGuess]);

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
  }, [isUrgent, pulseAnim, shakeAnim]);

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
        style={[
          styles.wordOption,
          {
            backgroundColor: selected ? `${colors.accent}15` : colors.card,
            borderColor: selected ? colors.accent : colors.border,
          },
        ]}
      >
        <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
        {selected && checkScale && (
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
  const { scaleAnim, handlePressIn, handlePressOut } = useBouncyPress({
    pressInScale: 0.94,
    disabled: !selectedWord,
  });

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
    paddingTop: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  timerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    gap: 10,
  },
  timerText: {
    fontSize: 30,
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
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'right',
    fontWeight: '500',
  },
  wordOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 16,
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
