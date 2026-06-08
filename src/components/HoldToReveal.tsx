import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Vibration,
  Pressable,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PopInView, PulseView, FloatingView } from './BouncyAnimations';

const { width } = Dimensions.get('window');

interface HoldToRevealProps {
  playerName: string;
  secretWord: string;
  category: string;
  isSpy: boolean;
  onRevealComplete: () => void;
}

export const HoldToReveal: React.FC<HoldToRevealProps> = ({
  playerName,
  secretWord,
  category,
  isSpy,
  onRevealComplete,
}) => {
  const { colors } = useTheme();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isPressing, setIsPressing] = useState(false);

  // Animation values
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const shakeY = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bouncy shake animation
  const startBouncyShake = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.spring(shakeX, { toValue: 6, tension: 400, friction: 5, useNativeDriver: true }),
          Animated.spring(shakeY, { toValue: 4, tension: 400, friction: 5, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(shakeX, { toValue: -6, tension: 400, friction: 5, useNativeDriver: true }),
          Animated.spring(shakeY, { toValue: -4, tension: 400, friction: 5, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(shakeX, { toValue: 4, tension: 400, friction: 5, useNativeDriver: true }),
          Animated.spring(shakeY, { toValue: -3, tension: 400, friction: 5, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(shakeX, { toValue: -4, tension: 400, friction: 5, useNativeDriver: true }),
          Animated.spring(shakeY, { toValue: 3, tension: 400, friction: 5, useNativeDriver: true }),
        ]),
      ])
    ).start();
  };

  const stopShake = () => {
    shakeX.stopAnimation();
    shakeY.stopAnimation();
    Animated.parallel([
      Animated.spring(shakeX, { toValue: 0, tension: 400, friction: 10, useNativeDriver: true }),
      Animated.spring(shakeY, { toValue: 0, tension: 400, friction: 10, useNativeDriver: true }),
    ]).start();
  };

  // Particles burst
  const startParticles = () => {
    particleAnims.forEach((anim) => anim.setValue(0));
    const animations = particleAnims.map((anim) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  };

  const handlePressIn = () => {
    if (isRevealed) return;
    setIsPressing(true);
    startBouncyShake();
    startParticles();

    // Squish effect then progress
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.92,
        tension: 500,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
    ]).start();

    Vibration.vibrate(30);

    pressTimer.current = setTimeout(() => {
      handleRevealSuccess();
    }, 2000);
  };

  const handlePressOut = () => {
    if (isRevealed) return;
    setIsPressing(false);
    stopShake();

    if (pressTimer.current) clearTimeout(pressTimer.current);

    // Bounce back with overshoot
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 500,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleRevealSuccess = () => {
    setIsRevealed(true);
    setIsPressing(false);
    stopShake();
    Vibration.vibrate([0, 50, 100, 50]);

    // Celebration bounce
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.1, tension: 400, friction: 6, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  // Particle animation calculation
  const getParticleStyle = (index: number, anim: Animated.Value) => {
    const angle = (index * 2 * Math.PI) / 8;
    const distance = 140;

    const translateX = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.cos(angle) * distance],
    });

    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.sin(angle) * distance],
    });

    const opacity = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.8, 0],
    });

    const particleScale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.3],
    });

    return {
      transform: [{ translateX }, { translateY }, { scale: particleScale }],
      opacity,
    };
  };

  // Progress bubble
  const bubbleScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 4],
  });

  const bubbleOpacity = progress.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 0.5, 0.9],
  });

  // Progress ring
  const progressRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Main Card */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              transform: [
                { translateX: shakeX },
                { translateY: shakeY },
                { scale },
              ],
            },
          ]}
        >
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.pressable}
          >
            <View
              style={[
                styles.card,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                },
              ]}
            >
              {/* Progress Bubble */}
              {isPressing && !isRevealed && (
                <Animated.View
                  style={[
                    styles.progressBubble,
                    {
                      backgroundColor: isSpy ? colors.danger : colors.accent,
                      opacity: bubbleOpacity,
                      transform: [{ scale: bubbleScale }],
                    },
                  ]}
                />
              )}

              {/* Progress Ring */}
              {isPressing && !isRevealed && (
                <View style={styles.progressRingContainer}>
                  <Animated.View
                    style={[
                      styles.progressRing,
                      {
                        borderColor: isSpy ? colors.danger : colors.accent,
                        transform: [{ rotate: progressRotate }],
                      },
                    ]}
                  />
                </View>
              )}

              {/* Content */}
              <View style={styles.content}>
                {!isRevealed ? (
                  // Pre-reveal UI
                  <View style={styles.innerContent}>
                    <PopInView delay={100}>
                      <Text style={[styles.title, { color: colors.text }]}>
                        دور: {playerName}
                      </Text>
                    </PopInView>
                    
                    <FloatingView distance={8} duration={2000}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: `${colors.accent}20` },
                        ]}
                      >
                        <PulseView maxScale={1.15} duration={1200}>
                          <Text style={styles.icon}>🕵️</Text>
                        </PulseView>
                      </View>
                    </FloatingView>
                    
                    <Text style={[styles.instruction, { color: colors.textMuted }]}>
                      اضغط مطولاً لكشف الكارت 🤫
                    </Text>
                    
                    {/* Progress percentage */}
                    {isPressing && (
                      <Animated.Text style={[styles.progressText, { color: colors.accent }]}>
                        {progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })}
                      </Animated.Text>
                    )}
                  </View>
                ) : (
                  // Post-reveal UI
                  <PopInView>
                    <View style={styles.innerContent}>
                      {isSpy ? (
                        <View style={styles.revealContent}>
                          <Text style={[styles.spyEmoji]}>🕵️‍♂️</Text>
                          <Text style={[styles.spyTitle, { color: colors.danger }]}>
                            أنت الجاسوس!
                          </Text>
                          <Text style={[styles.spyDescription, { color: colors.textMuted }]}>
                            حاول معرفة الكلمة السرية من خلال أسئلة اللاعبين! 🎭
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.revealContent}>
                          <Text style={[styles.categoryBadge, { backgroundColor: `${colors.accent}20`, color: colors.accent }]}>
                            {category}
                          </Text>
                          <Text style={[styles.wordLabel, { color: colors.text }]}>
                            الكلمة السرية:
                          </Text>
                          <Text style={[styles.wordText, { color: colors.accent }]}>
                            {secretWord}
                          </Text>
                        </View>
                      )}

                      <Pressable
                        onPress={onRevealComplete}
                        style={({ pressed }) => [
                          styles.button,
                          {
                            backgroundColor: colors.accent,
                            transform: [{ scale: pressed ? 0.95 : 1 }],
                          },
                        ]}
                      >
                        <Text style={styles.buttonText}>
                          فهمت! إخفاء وتمرير 🤫
                        </Text>
                      </Pressable>
                    </View>
                  </PopInView>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Particles */}
        {isPressing &&
          !isRevealed &&
          particleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                { backgroundColor: isSpy ? colors.danger : colors.accent },
                getParticleStyle(index, anim),
              ]}
            />
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 480,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardWrapper: {
    width: width * 0.88,
    height: 400,
    zIndex: 2,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    borderWidth: 2,
    padding: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  progressBubble: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: '35%',
    left: '35%',
    zIndex: 1,
  },
  progressRingContainer: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '38%',
    left: '38%',
    zIndex: 2,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  content: {
    flex: 1,
    width: '100%',
    zIndex: 3,
  },
  innerContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 56,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  revealContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  spyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  spyTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  spyDescription: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  categoryBadge: {
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  wordLabel: {
    fontSize: 18,
    marginBottom: 12,
  },
  wordText: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  particle: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 3,
  },
});
