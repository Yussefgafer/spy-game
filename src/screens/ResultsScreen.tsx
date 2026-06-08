import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RefreshCw, Home, Target, Users, Eye, CheckCircle, Sparkles } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { saveMatchResult } from '../database/sqlite';
import { hapticLight } from '../utils/haptics';
import { PopInView, SlideInBounceView, PulseView, FloatingView } from '../components/BouncyAnimations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

export const ResultsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ResultsRouteProp>();
  const { players, spies, secretWord, categoryName, correctVoters, spyGuessedCorrectly } = route.params;

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) return;
    
    // Save result with proper data
    const success = saveMatchResult(
      categoryName,
      secretWord,
      spies,
      spyGuessedCorrectly ? 'SPY' : 'PLAYERS',
      players.length * 10,
      players.map((name) => ({
        name,
        role: spies.includes(name) ? 'SPY' : 'PLAYER',
        votedCorrectly: correctVoters.includes(name),
        pointsGained: correctVoters.includes(name) ? 10 : 0,
      }))
    );
    if (success) setSaved(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spyWins = spyGuessedCorrectly;

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

        {/* Correct Voters */}
        {correctVoters.length > 0 && (
          <PopInView delay={400}>
            <BouncyCorrectVotersCard
              correctVoters={correctVoters}
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
              {players.map((player, index) => {
                const isSpy = spies.includes(player);
                const votedCorrectly = correctVoters.includes(player);
                return (
                  <PopInView key={player} delay={550 + index * 50}>
                    <BouncyPlayerRow
                      player={player}
                      isSpy={isSpy}
                      votedCorrectly={votedCorrectly}
                      colors={colors}
                    />
                  </PopInView>
                );
              })}
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
  colors: ThemeColors;
}

const BouncyWinnerCard: React.FC<BouncyWinnerCardProps> = ({ spyWins, colors }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

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
          {spyWins ? (
            <Text style={styles.winnerEmoji}>🕵️‍♂️</Text>
          ) : (
            <Text style={styles.winnerEmoji}>🎉</Text>
          )}
        </PulseView>
      </FloatingView>
      <Text style={[styles.winnerTitle, { color: spyWins ? colors.danger : colors.accent }]}>
        {spyWins ? 'فاز الجاسوس!' : 'فاز الأبرياء!'}
      </Text>
      <Text style={[styles.winnerSubtitle, { color: colors.textMuted }]}>
        {spyWins 
          ? 'اكتشف الجاسوس الكلمة السرية 👏' 
          : 'تمكن الأبرياء من كشف الجاسوس 🎊'}
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
interface BouncyCorrectVotersCardProps {
  correctVoters: string[];
  colors: ThemeColors;
}

const BouncyCorrectVotersCard: React.FC<BouncyCorrectVotersCardProps> = ({ correctVoters, colors }) => {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.infoHeader}>
        <PulseView maxScale={1.2} duration={1200}>
          <CheckCircle size={22} color={colors.accent} />
        </PulseView>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>صوّتوا بشكل صحيح</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{correctVoters.join('، ')}</Text>
      <Text style={[styles.pointsText, { color: colors.accent }]}>🏆 +10 نقاط لكل منهم</Text>
    </View>
  );
};

// Bouncy Player Row
interface BouncyPlayerRowProps {
  player: string;
  isSpy: boolean;
  votedCorrectly: boolean;
  colors: ThemeColors;
}

const BouncyPlayerRow: React.FC<BouncyPlayerRowProps> = ({ player, isSpy, votedCorrectly, colors }) => {
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
          {votedCorrectly && (
            <View style={[styles.badge, { backgroundColor: `${colors.accent}20` }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>⭐ +10</Text>
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
    paddingTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  winnerCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 24,
    marginBottom: 16,
  },
  winnerEmoji: {
    fontSize: 56,
  },
  winnerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 16,
  },
  winnerSubtitle: {
    fontSize: 15,
    marginTop: 10,
  },
  infoCard: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pointsText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  playersList: {
    marginTop: 12,
  },
  playerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  playerBadges: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 18,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
