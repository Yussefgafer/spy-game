import React, { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RefreshCw, Home, Target, Users, Eye, CheckCircle, Sparkles } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { saveMatchResult } from '../database/sqlite';
import { hapticLight } from '../utils/haptics';
import { PopInView, SlideInBounceView, PulseView, FloatingView } from '../components/BouncyAnimations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

export const ResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultsRouteProp>();
  const { players, spies, secretWord, categoryName, correctVoters, spyGuessedWord, winner } = route.params;

  const [saved, setSaved] = useState(false);

  // 🏆 نظام النقاط (قاعدة اللعبة الجديدة):
  //
  // [1] الأبرياء فازوا (winner = 'PLAYERS') + الجاسوس لم يخمّن (spyGuessedWord = false):
  //     - كل لاعب بريء صوّت على جاسوس يأخذ:
  //       pointsPerVoter = floor( (playersCount × 10) / correctVotersCount )
  //     - الجواسيس يأخذون 0.
  //     - مثال: 3 لاعبين، 1 صوّت صح: 30 نقطة له، الجواسيس 0.
  //     - مثال: 4 لاعبين، 2 صوّتوا صح: floor(40/2) = 20 لكل واحد.
  //
  // [2] الأبرياء فازوا + الجاسوس خمّن (winner = 'PLAYERS', spyGuessedWord = true):
  //     - نفس [1] (الأبرياء يأخذون نقاطهم).
  //     - لكن الجواسيس لا يأخذون شيئاً لأن الأبرياء كشفوهم.
  //     - (هذا السيناريو غريب: الجاسوس خمّن صح لكن الأبرياء صوّتوا عليه أيضاً.)
  //
  // [3] الجواسيس فازوا + خمّنوا (winner = 'SPY', spyGuessedWord = true):
  //     - الأبرياء لا يأخذون نقاط (الجواسيس فازوا).
  //     - كل جاسوس يأخذ:
  //       pointsPerSpy = floor( (playersCount × 10 / 2) / spiesCount )
  //     - مثال: 5 لاعبين، 2 جواسيس: floor(50/2/2) = floor(12.5) = 12 لكل جاسوس.
  //     - مثال: 4 لاعبين، 1 جاسوس: floor(40/2) = 20.
  //
  // [4] الجواسيس فازوا بدون تخمين (winner = 'SPY', spyGuessedWord = false):
  //     - "الهروب": لا أحد صوّت على جاسوس (correctVoters = []).
  //     - كل جاسوس يأخذ:
  //       pointsPerSpy = floor( playersCount / spiesCount )
  //     - مثال: 5 لاعبين، 1 جاسوس: floor(5/1) = 5.
  //     - مثال: 5 لاعبين، 2 جواسيس: floor(5/2) = 2 لكل واحد (0.5 تُتجاهل).
  //     - مثال: 3 لاعبين، 1 جاسوس: floor(3/1) = 3.
  //     - مثال: 4 لاعبين، 2 جواسيس: floor(4/2) = 2 لكل واحد.
  //
  // قاعدة الكسور: floor() — أي 0.9 تصبح 0.
  const playerResults = useMemo(() => {
    const playersCount = players.length;
    const spiesCount = spies.length;
    const correctVotersCount = correctVoters.length;

    return players.map((name) => {
      const isSpy = spies.includes(name);
      const isCorrectVoter = correctVoters.includes(name);
      let pointsGained = 0;

      if (winner === 'PLAYERS') {
        // الأبرياء فازوا.
        // اللاعب الذي صوّت صح يأخذ نقاطه.
        // (الجواسيس لا يأخذون شيئاً في كلتا الحالتين: سواء الجاسوس خمّن أم لا.)
        if (!isSpy && isCorrectVoter) {
          // الصيغة: floor((playersCount × 10) / correctVotersCount)
          // القسمة على 0 محمية لأن winner = 'PLAYERS' → correctVotersCount ≥ 1.
          pointsGained = Math.floor((playersCount * 10) / correctVotersCount);
        }
        // الجواسيس: 0 نقطة.
      } else {
        // winner === 'SPY' (الجواسيس فازوا).
        if (isSpy) {
          if (spyGuessedWord) {
            // الحالة [3]: خمّنوا الكلمة
            // الصيغة: floor((playersCount × 10 / 2) / spiesCount)
            pointsGained = Math.floor((playersCount * 10 / 2) / spiesCount);
          } else {
            // الحالة [4]: هروب (الجميع skip)
            // الصيغة: floor(playersCount / spiesCount)
            pointsGained = Math.floor(playersCount / spiesCount);
          }
        }
        // الأبرياء: 0 نقطة.
      }

      return {
        name,
        role: isSpy ? ('SPY' as const) : ('PLAYER' as const),
        votedCorrectly: isCorrectVoter,
        pointsGained,
      };
    });
  }, [players, spies, correctVoters, spyGuessedWord, winner]);

  // مجموع النقاط في هذه الجولة (للحفظ في DB)
  // الصيغة القديمة: playersCount × 10 — مع الـ system الجديد هذا غير منطقي.
  // الحل: مجموع نقاط كل اللاعبين.
  const totalPoints = useMemo(
    () => playerResults.reduce((sum, p) => sum + p.pointsGained, 0),
    [playerResults]
  );

  useEffect(() => {
    if (saved) return;
    saveMatchResult(
      categoryName,
      secretWord,
      spies,
      winner,
      totalPoints,
      playerResults
    ).then((success) => {
      if (success) setSaved(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // للتوافق مع BouncyWinnerCard — تستقبل spyWins: boolean
  const spyWins = winner === 'SPY';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🎉 النتيجة</Text>
        </View>
      </PopInView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Winner Card */}
        <PopInView delay={100}>
          <BouncyWinnerCard
            spyWins={spyWins}
            spyGuessedWord={spyGuessedWord}
            winner={winner}
            colors={colors}
          />
        </PopInView>

        {/* Secret Word */}
        <PopInView delay={200}>
          <BouncyInfoCard
            icon={<Target size={24} color={colors.accent} />}
            label="الكلمة السرية"
            value={secretWord || 'غير متوفرة'}
            valueColor={colors.accent}
            colors={colors}
          />
        </PopInView>

        {/* Spies */}
        <PopInView delay={300}>
          <BouncyInfoCard
            icon={<Eye size={24} color={colors.danger} />}
            label="الجاسوس"
            value={spies.length > 0 ? spies.join('، ') : 'غير متوفر'}
            valueColor={colors.danger}
            colors={colors}
          />
        </PopInView>

        {/* Correct Voters (إذا فاز الأبرياء) */}
        {winner === 'PLAYERS' && correctVoters.length > 0 && (
          <PopInView delay={400}>
            <BouncyCorrectVotersCard
              correctVoters={correctVoters}
              playersCount={players.length}
              colors={colors}
            />
          </PopInView>
        )}

        {/* All Players */}
        <PopInView delay={500}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoHeader}>
              <Users size={22} color={colors.textMuted} />
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>اللاعبون ({players.length})</Text>
            </View>
            <View style={styles.playersList}>
              {playerResults.map((p, index) => (
                <PopInView key={p.name} delay={550 + index * 50}>
                  <BouncyPlayerRow
                    player={p.name}
                    isSpy={p.role === 'SPY'}
                    votedCorrectly={p.votedCorrectly}
                    pointsGained={p.pointsGained}
                    colors={colors}
                  />
                </PopInView>
              ))}
            </View>
          </View>
        </PopInView>
      </ScrollView>

      {/* Actions */}
      <SlideInBounceView delay={600}>
        <View style={styles.footer}>
          <BouncyPrimaryButton
            onPress={() => navigation.popToTop()}
            colors={colors}
            label="لعبة جديدة"
            icon={<RefreshCw size={22} color="#000" />}
          />
          <BouncySecondaryButton
            onPress={() => navigation.popToTop()}
            colors={colors}
            label="الرئيسية"
            icon={<Home size={22} color={colors.text} />}
          />
        </View>
      </SlideInBounceView>
    </View>
  );
};

// Bouncy Winner Card
interface BouncyWinnerCardProps {
  spyWins: boolean;
  spyGuessedWord: boolean;
  winner: 'SPY' | 'PLAYERS';
  colors: ThemeColors;
}

const BouncyWinnerCard: React.FC<BouncyWinnerCardProps> = ({ spyWins, spyGuessedWord, winner, colors }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim, rotateAnim]);

  // نصوص مختلفة حسب السيناريو (3 حالات للجواسيس، 1 للأبرياء)
  const getTitleAndSubtitle = (): { title: string; subtitle: string } => {
    if (winner === 'PLAYERS') {
      return {
        title: 'فاز الأبرياء!',
        subtitle: 'تمكن الأبرياء من كشف الجاسوس 🎊',
      };
    }
    // winner === 'SPY'
    if (spyGuessedWord) {
      return {
        title: 'فاز الجاسوس!',
        subtitle: 'اكتشف الجاسوس الكلمة السرية 👏',
      };
    }
    return {
      title: 'فاز الجاسوس!',
      subtitle: 'نجا الجاسوس من التصويت 🏃‍♂️',
    };
  };

  const { title, subtitle } = getTitleAndSubtitle();

  return (
    <Animated.View
      style={[
        styles.winnerCard,
        {
          backgroundColor: spyWins ? `${colors.danger}15` : `${colors.accent}15`,
          transform: [
            { scale: scaleAnim },
            { rotate: rotateAnim.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] }) },
          ],
        },
      ]}
    >
      <FloatingView distance={6} duration={2500}>
        <PulseView maxScale={1.15} duration={1500}>
          <Text style={styles.winnerEmoji}>{spyWins ? '🕵️‍♂️' : '🎉'}</Text>
        </PulseView>
      </FloatingView>
      <Text style={[styles.winnerTitle, { color: spyWins ? colors.danger : colors.accent }]}>
        {title}
      </Text>
      <Text style={[styles.winnerSubtitle, { color: colors.textMuted }]}>
        {subtitle}
      </Text>
    </Animated.View>
  );
};

// Bouncy Info Card
interface BouncyInfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
  colors: ThemeColors;
}

const BouncyInfoCard: React.FC<BouncyInfoCardProps> = ({ icon, label, value, valueColor, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoHeader}>
          {icon}
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        </View>
        <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
      </View>
    </Animated.View>
  );
};

// Bouncy Correct Voters Card
// يعرض عدد النقاط الديناميكي (نظام النقاط الجديد)
interface BouncyCorrectVotersCardProps {
  correctVoters: string[];
  playersCount: number;
  colors: ThemeColors;
}

const BouncyCorrectVotersCard: React.FC<BouncyCorrectVotersCardProps> = ({ correctVoters, playersCount, colors }) => {
  // نقاط ديناميكية حسب قاعدة اللعبة الجديدة
  const pointsPerVoter = Math.floor((playersCount * 10) / correctVoters.length);

  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.infoHeader}>
        <PulseView maxScale={1.2} duration={1200}>
          <CheckCircle size={22} color={colors.accent} />
        </PulseView>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>صوّتوا بشكل صحيح</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{correctVoters.join('، ')}</Text>
      <Text style={[styles.pointsText, { color: colors.accent }]}>
        🏆 +{pointsPerVoter} نقطة لكل منهم
      </Text>
    </View>
  );
};

// Bouncy Player Row
// يعرض نقاط ديناميكية من نظام النقاط الجديد
interface BouncyPlayerRowProps {
  player: string;
  isSpy: boolean;
  votedCorrectly: boolean;
  pointsGained: number;
  colors: ThemeColors;
}

const BouncyPlayerRow: React.FC<BouncyPlayerRowProps> = ({ player, isSpy, votedCorrectly: _votedCorrectly, pointsGained, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={styles.playerRow}>
        <Text style={[styles.playerName, { color: colors.text }]}>{player}</Text>
        <View style={styles.playerBadges}>
          {isSpy && (
            <View style={[styles.badge, { backgroundColor: `${colors.danger}20` }]}>
              <Text style={[styles.badgeText, { color: colors.danger }]}>🕵️ جاسوس</Text>
            </View>
          )}
          {pointsGained > 0 && (
            <View style={[styles.badge, { backgroundColor: `${colors.accent}20` }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>⭐ +{pointsGained}</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

// Bouncy Primary Button
interface BouncyPrimaryButtonProps {
  onPress: () => void;
  colors: ThemeColors;
  label: string;
  icon: React.ReactNode;
}

const BouncyPrimaryButton: React.FC<BouncyPrimaryButtonProps> = ({ onPress, colors, label, icon }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
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
        style={[styles.primaryButton, { backgroundColor: colors.accent }]}
      >
        <Sparkles size={20} color="#000" />
        {icon}
        <Text style={styles.primaryButtonText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Secondary Button
interface BouncySecondaryButtonProps {
  onPress: () => void;
  colors: ThemeColors;
  label: string;
  icon: React.ReactNode;
}

const BouncySecondaryButton: React.FC<BouncySecondaryButtonProps> = ({ onPress, colors, label, icon }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
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
        style={[styles.secondaryButton, { borderColor: colors.border }]}
      >
        {icon}
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  winnerCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  winnerEmoji: {
    fontSize: 52,
  },
  winnerTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginTop: 18,
    lineHeight: 30,
  },
  winnerSubtitle: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  infoCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  infoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
  },
  playersList: {
    marginTop: 14,
  },
  playerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  playerBadges: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    gap: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  secondaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
