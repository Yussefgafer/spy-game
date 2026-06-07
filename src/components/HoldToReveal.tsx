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

  // قيم الأنيميشن
  const progress = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;

  // أنيميشن الجزيئات (Particles)
  const particleAnims = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const vibrationInterval = useRef<NodeJS.Timeout | null>(null);

  // أنيميشن الاهتزاز (Shaking) المتزايد مع الوقت
  const startShaking = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shake, {
          toValue: { x: -4, y: 2 },
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: { x: 4, y: -2 },
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: { x: -3, y: -3 },
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: { x: 3, y: 3 },
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopShaking = () => {
    shake.setValue({ x: 0, y: 0 });
  };

  // إطلاق الجزيئات (Particles Burst)
  const startParticles = () => {
    particleAnims.forEach((anim) => anim.setValue(0));
    const animations = particleAnims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  };

  const handlePressIn = () => {
    if (isRevealed) return;
    setIsPressing(true);
    startShaking();
    startParticles();

    // أنيميشن تمدد العداد والضغط
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
    ]).start();

    // نبضات اهتزاز خفيفة كل 400 مللي ثانية أثناء الضغط
    vibrationInterval.current = setInterval(() => {
      Vibration.vibrate(50);
    }, 400);

    // عداد اكتمال الثانيتين
    pressTimer.current = setTimeout(() => {
      handleRevealSuccess();
    }, 2000);
  };

  const handlePressOut = () => {
    if (isRevealed) return;
    setIsPressing(false);
    stopShaking();

    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (vibrationInterval.current) clearInterval(vibrationInterval.current);

    // إعادة العداد لحالته الأصلية
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRevealSuccess = () => {
    setIsRevealed(true);
    setIsPressing(false);
    stopShaking();
    if (vibrationInterval.current) clearInterval(vibrationInterval.current);
    Vibration.vibrate(300); // اهتزاز قوي عند النجاح
  };

  // تنظيف العدادات عند إزالة المكون
  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
      if (vibrationInterval.current) clearInterval(vibrationInterval.current);
    };
  }, []);

  // حساب حركة الجزيئات في اتجاهات مختلفة
  const getParticleStyle = (index: number, anim: Animated.Value) => {
    const angle = (index * 2 * Math.PI) / 6;
    const distance = 120;

    const translateX = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.cos(angle) * distance],
    });

    const translateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.sin(angle) * distance],
    });

    const opacity = anim.interpolate({
      inputRange: [0, 0.8, 1],
      outputRange: [1, 0.8, 0],
    });

    const particleScale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.4],
    });

    return {
      transform: [{ translateX }, { translateY }, { scale: particleScale }],
      opacity,
    };
  };

  // عرض العداد السائل المتمدد خلف الكارت
  const bubbleScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 3.5],
  });

  const bubbleOpacity = progress.interpolate({
    inputRange: [0, 0.1, 1],
    outputRange: [0, 0.4, 0.85],
  });

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {/* الكارت الرئيسي للاهتزاز وكشف الهوية */}
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              transform: [
                { translateX: shake.x },
                { translateY: shake.y },
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
              {/* العداد السائل الخلفي (Progress Bubble) المندمج مع الكارت */}
              {isPressing && !isRevealed && (
                <Animated.View
                  style={[
                    styles.progressBubble,
                    {
                      backgroundColor: colors.accent,
                      opacity: bubbleOpacity,
                      transform: [{ scale: bubbleScale }],
                    },
                  ]}
                />
              )}

              {/* محتوى الكارت */}
              <View style={styles.content}>
                {!isRevealed ? (
                  // واجهة ما قبل الكشف
                  <View style={styles.innerContent}>
                    <Text style={[styles.title, { color: colors.text }]}>
                      دور اللاعب: {playerName}
                    </Text>
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: colors.accentMuted },
                      ]}
                    >
                      <Text style={[styles.icon, { color: colors.accent }]}>
                        🕵️‍♂️
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.instruction,
                        { color: colors.textMuted },
                      ]}
                    >
                      اضغط مطولاً لثانيتين لكشف الكارت 🤫
                    </Text>
                  </View>
                ) : (
                  // واجهة ما بعد الكشف
                  <View style={styles.innerContent}>
                    {isSpy ? (
                      <View style={styles.revealContent}>
                        <Text
                          style={[styles.spyTitle, { color: colors.danger }]}
                        >
                          أنت الجاسوس! 🕵️‍♂️
                        </Text>
                        <Text
                          style={[
                            styles.spyDescription,
                            { color: colors.textMuted },
                          ]}
                        >
                          حاول معرفة الكلمة السرية من خلال أسئلة اللاعبين دون أن
                          يكتشفك أحد!
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.revealContent}>
                        <Text
                          style={[
                            styles.categoryText,
                            { color: colors.textMuted },
                          ]}
                        >
                          التصنيف: {category}
                        </Text>
                        <Text
                          style={[styles.wordLabel, { color: colors.text }]}
                        >
                          الكلمة السرية هي:
                        </Text>
                        <Text
                          style={[styles.wordText, { color: colors.accent }]}
                        >
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
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text style={styles.buttonText}>
                        فهمت، إخفاء وتمرير للهاتف التالي 🤫
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* جزيئات نيون متطايرة حول الكارت أثناء الشحن */}
        {isPressing &&
          !isRevealed &&
          particleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                { backgroundColor: colors.accent },
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
    height: 450,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardWrapper: {
    width: width * 0.85,
    height: 380,
    zIndex: 2,
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    overflow: 'hidden', // مهم جداً لكي لا يخرج العداد السائل عن حدود الكارت
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  content: {
    flex: 1,
    width: '100%',
    zIndex: 3, // ليكون المحتوى فوق العداد السائل دائماً
  },
  innerContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'System',
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 50,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  revealContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  spyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  spyDescription: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  categoryText: {
    fontSize: 16,
    marginBottom: 12,
  },
  wordLabel: {
    fontSize: 20,
    marginBottom: 8,
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: 'bold',
  },
  progressBubble: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: '30%',
    left: '30%',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 3,
  },
});
