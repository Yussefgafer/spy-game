import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import { REVEAL_HOLD_DURATION, ANIM_TIMING_NORMAL } from '../constants/animations';
import { PopInView } from '../components/BouncyAnimations';
import { useBouncyPress } from '../hooks/useBouncyPress';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RevealRouteProp = RouteProp<RootStackParamList, 'Reveal'>;

const REVEAL_DURATION = REVEAL_HOLD_DURATION;

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

  // Cleanup when currentIndex changes (also runs on unmount per React rules)
  useEffect(() => {
    return () => {
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [currentIndex]);

  const handleRevealComplete = useCallback(() => {
    revealTimerRef.current = null;
    setIsPressing(false);
    hapticSuccess();
    setIsRevealed(true);
  }, []);

  const handlePressIn = useCallback(() => {
    if (isRevealed || isPressing) return;

    setIsPressing(true);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: REVEAL_DURATION,
      useNativeDriver: false,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();

    hapticLight();

    revealTimerRef.current = setTimeout(() => {
      handleRevealComplete();
    }, REVEAL_DURATION);
    // progressAnim/scaleAnim من useRef (ثابتة)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed, isPressing, handleRevealComplete]);

  const handlePressOut = useCallback(() => {
    if (isRevealed || !isPressing) return;

    setIsPressing(false);

    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    Animated.timing(progressAnim, {
      toValue: 0,
      ...ANIM_TIMING_NORMAL,
      useNativeDriver: false,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    // progressAnim/scaleAnim من useRef (ثابتة)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed, isPressing]);

  const handleNext = useCallback(() => {
    if (!isRevealed) {
      hapticError();
      return;
    }

    hapticLight();

    if (isLastPlayer) {
      navigation.navigate('Gameplay', { players, spies, secretWord, categoryName, categoryId });
    } else {
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
    // progressAnim/scaleAnim من useRef (ثابتة)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealed, isLastPlayer, navigation, players, spies, secretWord, categoryName, categoryId, currentIndex]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>كشف الأدوار</Text>
          <PopInView delay={100}>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              اللاعب {currentIndex + 1} من {players.length}
            </Text>
          </PopInView>
        </View>
      </PopInView>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {players.map((_, index) => (
          <PopInView key={index} delay={150 + index * 30}>
            <View
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
          </PopInView>
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
      <PopInView delay={300}>
        <View style={styles.footer}>
          <BouncyRevealNextButton
            onPress={handleNext}
            disabled={!isRevealed}
            isLastPlayer={isLastPlayer}
            colors={colors}
          />
        </View>
      </PopInView>
    </View>
  );
};

// Bouncy Next Button
interface BouncyRevealNextButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLastPlayer: boolean;
  colors: ThemeColors;
}

const BouncyRevealNextButton: React.FC<BouncyRevealNextButtonProps> = ({ onPress, disabled, isLastPlayer, colors }) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useBouncyPress({
    pressInScale: 0.94,
    disabled,
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
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
          },
        ]}
      >
        <Text style={[styles.nextButtonText, { color: !disabled ? '#000' : colors.textMuted }]}>
          {isLastPlayer ? 'ابدأ اللعب' : 'التالي'}
        </Text>
        <ArrowLeft size={20} color={!disabled ? '#000' : colors.textMuted} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 16,
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 28,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 24,
    lineHeight: 28,
  },
  card: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 20,
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
    paddingVertical: 24,
  },
  revealText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
  },
  revealHint: {
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
  revealedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  roleIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 28,
  },
  roleDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  categoryLabel: {
    fontSize: 13,
    marginTop: 24,
    fontWeight: '600',
  },
  secretWord: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 12,
  },
  footer: {
    paddingVertical: 16,
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
    fontWeight: 'bold',
  },
});
