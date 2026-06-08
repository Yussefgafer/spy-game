import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RevealRouteProp = RouteProp<RootStackParamList, 'Reveal'>;

const REVEAL_DURATION = 1500; // 1.5 seconds to reveal

export const RevealScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RevealRouteProp>();
  const { players, spies, secretWord, categoryName, categoryId } = route.params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer = players[currentIndex];
  const isSpy = spies.includes(currentPlayer);
  const isLastPlayer = currentIndex === players.length - 1;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  // Cleanup when index changes
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [currentIndex]);

  const handlePressIn = () => {
    if (isRevealed || isPressing) return;

    setIsPressing(true);

    // Start progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: REVEAL_DURATION,
      useNativeDriver: false,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();

    // Haptic feedback at start
    hapticLight();

    // Set timer for reveal
    revealTimerRef.current = setTimeout(() => {
      handleRevealComplete();
    }, REVEAL_DURATION);
  };

  const handlePressOut = () => {
    if (isRevealed || !isPressing) return;

    setIsPressing(false);

    // Cancel any pending timer
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    // Reset progress animation
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleRevealComplete = () => {
    // Clear timer reference
    revealTimerRef.current = null;
    setIsPressing(false);
    
    // Success haptic
    hapticSuccess();
    
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (!isRevealed) {
      hapticError();
      return;
    }

    hapticLight();
    
    if (isLastPlayer) {
      navigation.navigate('Gameplay', { players, spies, secretWord, categoryName, categoryId });
    } else {
      // Cleanup before changing player
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
      setIsPressing(false);
      progressAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>كشف الأدوار</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          اللاعب {currentIndex + 1} من {players.length}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {players.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index < currentIndex
                  ? colors.accent
                  : index === currentIndex
                    ? (isRevealed ? colors.accent : colors.border)
                    : colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Player Card */}
      <View style={styles.cardContainer}>
        <Text style={[styles.playerName, { color: colors.text }]}>{currentPlayer}</Text>
        
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Progress Overlay */}
          {!isRevealed && isPressing && (
            <Animated.View
              style={[
                styles.progressOverlay,
                { backgroundColor: colors.accent, width: progressWidth },
              ]}
            />
          )}

          {!isRevealed ? (
            // Before Reveal
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.revealButton}
            >
              <EyeOff size={48} color={colors.textMuted} />
              <Text style={[styles.revealText, { color: colors.textMuted }]}>
                اضغط مطولاً للكشف
              </Text>
              <Text style={[styles.revealHint, { color: colors.textMuted }]}>
                لا تظهر الشاشة لأي شخص آخر!
              </Text>
            </Pressable>
          ) : (
            // After Reveal
            <View style={styles.revealedContent}>
              {isSpy ? (
                // Spy
                <>
                  <View style={[styles.roleIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                    <Eye size={40} color={colors.danger} />
                  </View>
                  <Text style={[styles.roleTitle, { color: colors.danger }]}>أنت الجاسوس!</Text>
                  <Text style={[styles.roleDescription, { color: colors.textMuted }]}>
                    حاول معرفة الكلمة من خلال أسئلة اللاعبين
                  </Text>
                </>
              ) : (
                // Innocent
                <>
                  <View style={[styles.roleIcon, { backgroundColor: `${colors.accent}20` }]}>
                    <Eye size={40} color={colors.accent} />
                  </View>
                  <Text style={[styles.roleTitle, { color: colors.text }]}>أنت بريء</Text>
                  <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>
                    التصنيف: {categoryName}
                  </Text>
                  <Text style={[styles.secretWord, { color: colors.accent }]}>{secretWord}</Text>
                </>
              )}
            </View>
          )}
        </Animated.View>
      </View>

      {/* Next Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          disabled={!isRevealed}
          style={[
            styles.nextButton,
            {
              backgroundColor: isRevealed ? colors.accent : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.nextButtonText, { color: isRevealed ? '#000' : colors.textMuted }]}>
            {isLastPlayer ? 'ابدأ اللعب' : 'التالي'}
          </Text>
          <ArrowLeft size={20} color={isRevealed ? '#000' : colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    paddingTop: 8,
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  playerName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    opacity: 0.15,
  },
  revealButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  revealText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  revealHint: {
    fontSize: 14,
    marginTop: 10,
  },
  revealedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  categoryLabel: {
    fontSize: 14,
    marginTop: 20,
  },
  secretWord: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  footer: {
    paddingTop: 16,
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
