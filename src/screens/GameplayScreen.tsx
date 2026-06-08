import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Users, ArrowLeft, HelpCircle, Zap, Timer, AlertTriangle, Clock, Play, Pause } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { hapticLight, hapticSuccess, hapticWarning } from '../utils/haptics';
import { PopInView, SlideInBounceView, FloatingView, PulseView } from '../components/BouncyAnimations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameplayRouteProp = RouteProp<RootStackParamList, 'Gameplay'>;

const TIMER_SECONDS = 180; // 3 دقائق
const TIMER_SETTINGS_KEY = '@spy_game_timer_enabled';

export const GameplayScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameplayRouteProp>();
  const { players, spies, secretWord, categoryName, categoryId } = route.params;

  // Timer state
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningTriggeredRef = useRef(false);

  // Load timer setting from AsyncStorage
  useEffect(() => {
    const loadTimerSetting = async () => {
      try {
        const saved = await AsyncStorage.getItem(TIMER_SETTINGS_KEY);
        if (saved !== null) {
          setTimerEnabled(saved === 'true');
        }
      } catch (e) {
        console.log('Error loading timer setting:', e);
      }
    };
    loadTimerSetting();
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerActive && timerEnabled) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleEndQuestions();
            return 0;
          }
          // Haptic warning at 30 seconds
          if (prev === 31 && !warningTriggeredRef.current) {
            warningTriggeredRef.current = true;
            hapticWarning();
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, timerEnabled]);

  const toggleTimerEnabled = async () => {
    hapticLight();
    const newValue = !timerEnabled;
    setTimerEnabled(newValue);
    setTimerActive(newValue);
    setTimeLeft(TIMER_SECONDS);
    warningTriggeredRef.current = false;
    try {
      await AsyncStorage.setItem(TIMER_SETTINGS_KEY, String(newValue));
    } catch (e) {
      console.log('Error saving timer setting:', e);
    }
  };

  const toggleTimerPause = () => {
    hapticLight();
    setTimerActive(!timerActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndQuestions = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    hapticSuccess();
    navigation.navigate('Vote', { players, spies, secretWord, categoryName, categoryId });
  };

  const isUrgent = timeLeft <= 30 && timerEnabled;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <FloatingView distance={4} duration={2000}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <PopInView delay={50}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>❓ مرحلة الأسئلة</Text>
            </PopInView>
            <PopInView delay={100}>
              <Pressable
                onPress={toggleTimerEnabled}
                style={[styles.timerToggleBtn, { backgroundColor: timerEnabled ? `${colors.accent}20` : colors.card, borderColor: timerEnabled ? colors.accent : colors.border }]}
              >
                <Clock size={20} color={timerEnabled ? colors.accent : colors.textMuted} />
              </Pressable>
            </PopInView>
          </View>
          <PopInView delay={150}>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              اسألوا بعضكم البعض لكشف الجاسوس
            </Text>
          </PopInView>
        </View>
      </FloatingView>

      {/* Timer Card */}
      {timerEnabled && (
        <PopInView delay={200}>
          <BouncyTimerCard
            timeLeft={timeLeft}
            isUrgent={isUrgent}
            isPaused={!timerActive}
            formatTime={formatTime}
            onTogglePause={toggleTimerPause}
            colors={colors}
          />
        </PopInView>
      )}

      {/* Players */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <PopInView delay={150}>
          <View style={[styles.playersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.playersHeader}>
              <PulseView maxScale={1.1} duration={1500}>
                <Users size={24} color={colors.accent} />
              </PulseView>
              <Text style={[styles.playersTitle, { color: colors.text }]}>اللاعبون ({players.length})</Text>
            </View>
            {players.map((player, index) => (
              <PopInView key={index} delay={200 + index * 50}>
                <BouncyPlayerRow
                  player={player}
                  index={index}
                  total={players.length}
                  colors={colors}
                />
              </PopInView>
            ))}
          </View>
        </PopInView>

        {/* Instructions Card */}
        <PopInView delay={400}>
          <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FloatingView distance={3} duration={2500}>
              <HelpCircle size={28} color={colors.accent} />
            </FloatingView>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>💡 كيف تلعب</Text>
            <Text style={[styles.instructionText, { color: colors.textMuted }]}>
              كل لاعب يسأل لاعباً آخر سؤالاً عن الكلمة السرية.{'\n'}
              حاولوا كشف الجاسوس من خلال إجاباته الغريبة!
            </Text>
          </View>
        </PopInView>
      </ScrollView>

      {/* End Button */}
      <SlideInBounceView delay={500}>
        <View style={styles.footer}>
          <BouncyEndButton
            onPress={handleEndQuestions}
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
  isPaused: boolean;
  formatTime: (seconds: number) => string;
  onTogglePause: () => void;
  colors: ThemeColors;
}

const BouncyTimerCard: React.FC<BouncyTimerCardProps> = ({ timeLeft, isUrgent, isPaused, formatTime, onTogglePause, colors }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: timeLeft / TIMER_SECONDS,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  useEffect(() => {
    if (isUrgent && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.spring(pulseAnim, { toValue: 1.08, tension: 300, friction: 8, useNativeDriver: true }),
          Animated.spring(pulseAnim, { toValue: 1, tension: 300, friction: 8, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      shakeAnim.setValue(0);
    }
  }, [isUrgent, isPaused]);

  const handlePressIn = () => {
    hapticLight();
  };

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
        opacity: isPaused ? 0.7 : 1,
      },
    ]}>
      {/* Progress bar background */}
      <Animated.View style={[
        styles.timerProgress,
        {
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
          backgroundColor: isUrgent ? 'rgba(255,255,255,0.2)' : `${colors.accent}20`,
        },
      ]} />
      
      <Timer size={28} color={isUrgent ? '#FFF' : colors.accent} />
      <Text style={[styles.timerText, { color: isUrgent ? '#FFF' : colors.text }]}>
        {formatTime(timeLeft)}
      </Text>
      
      {isUrgent && !isPaused && (
        <View style={styles.urgentContainer}>
          <AlertTriangle size={18} color="#FFF" />
          <Text style={styles.urgentText}>أسرع!</Text>
        </View>
      )}
      
      {/* Pause/Play button */}
      <Pressable onPressIn={handlePressIn} onPress={onTogglePause} style={styles.pauseBtn}>
        {isPaused ? (
          <Play size={22} color={isUrgent ? '#FFF' : colors.accent} fill={isUrgent ? '#FFF' : colors.accent} />
        ) : (
          <Pause size={22} color={isUrgent ? '#FFF' : colors.accent} fill={isUrgent ? '#FFF' : colors.accent} />
        )}
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Player Row
interface BouncyPlayerRowProps {
  player: string;
  index: number;
  total: number;
  colors: ThemeColors;
}

const BouncyPlayerRow: React.FC<BouncyPlayerRowProps> = ({ player, index, total, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View
        style={[
          styles.playerItem,
          index < total - 1 && { borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.playerNumber}>
          <Text style={[styles.playerNumberText, { color: colors.accent }]}>{index + 1}</Text>
        </View>
        <Text style={[styles.playerName, { color: colors.text }]}>{player}</Text>
      </View>
    </Animated.View>
  );
};

// Bouncy End Button
interface BouncyEndButtonProps {
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyEndButton: React.FC<BouncyEndButtonProps> = ({ onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.94, tension: 400, friction: 10, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: -5, tension: 300, friction: 8, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, tension: 300, friction: 8, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
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
        style={[styles.endButton, { backgroundColor: colors.accent }]}
      >
        <Zap size={22} color="#000" />
        <Text style={styles.endButtonText}>انتهت الأسئلة!</Text>
        <ArrowLeft size={22} color="#000" />
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
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 6,
  },
  timerToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    gap: 12,
    overflow: 'hidden',
  },
  timerProgress: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 18,
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
  pauseBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  playersCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 16,
  },
  playersHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  playerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  playerNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 16,
    textAlign: 'right',
    fontWeight: '500',
  },
  instructionCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  instructionText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 10,
  },
  footer: {
    padding: 16,
  },
  endButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 16,
    gap: 10,
  },
  endButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
});
