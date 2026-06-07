import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Timer, AlertTriangle, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { CATEGORIES, shuffleArray } from '../../App';
import { hapticLight, hapticSuccess, hapticError, hapticWarning } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SpyGuessRouteProp = RouteProp<RootStackParamList, 'SpyGuess'>;

const TIMER_SECONDS = 60;

export const SpyGuessScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SpyGuessRouteProp>();
  const { correctWord } = route.params;

  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Get random words for guessing
    const category = CATEGORIES[0]; // Default category
    const otherWords = category.words.filter((w) => w !== correctWord);
    const randomWords = shuffleArray(otherWords).slice(0, 5);
    setShuffledWords(shuffleArray([...randomWords, correctWord]));

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - spy loses
          if (timerRef.current) clearInterval(timerRef.current);
          handleGuess(correctWord); // Wrong guess
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
  }, []);

  const handleGuess = (word: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const isCorrect = word === correctWord;
    
    if (isCorrect) {
      hapticSuccess();
    } else {
      hapticError();
    }

    // Navigate to results
    navigation.navigate('Results', {
      config: { category: 'places', spyCount: 1, players: [] },
      spies: [],
      secretWord: correctWord,
      correctVoters: [],
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>فرصة الجاسوس الأخيرة</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          خمّن الكلمة السرية للفوز!
        </Text>
      </View>

      {/* Timer */}
      <View style={[styles.timerCard, { backgroundColor: isUrgent ? colors.danger : colors.card, borderColor: isUrgent ? colors.danger : colors.border }]}>
        <Timer size={24} color={isUrgent ? '#FFF' : colors.accent} />
        <Text style={[styles.timerText, { color: isUrgent ? '#FFF' : colors.text }]}>
          {formatTime(timeLeft)}
        </Text>
        {isUrgent && (
          <View style={styles.urgentContainer}>
            <AlertTriangle size={16} color="#FFF" />
            <Text style={styles.urgentText}>أسرع!</Text>
          </View>
        )}
      </View>

      {/* Word Options */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>اختر الكلمة السرية:</Text>
        {shuffledWords.map((word, index) => {
          const isSelected = selectedWord === word;
          return (
            <Pressable
              key={index}
              onPress={() => {
                hapticLight();
                setSelectedWord(word);
              }}
              style={[
                styles.wordOption,
                {
                  backgroundColor: isSelected ? `${colors.accent}20` : colors.card,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => selectedWord && handleGuess(selectedWord)}
          disabled={!selectedWord}
          style={[
            styles.confirmButton,
            {
              backgroundColor: selectedWord ? colors.accent : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.confirmButtonText, { color: selectedWord ? '#000' : colors.textMuted }]}>
            تأكيد الاختيار
          </Text>
          <ArrowLeft size={20} color={selectedWord ? '#000' : colors.textMuted} />
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
  timerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  timerText: {
    fontSize: 36,
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
    fontSize: 16,
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
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'right',
  },
  wordOption: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
  },
  confirmButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
});
