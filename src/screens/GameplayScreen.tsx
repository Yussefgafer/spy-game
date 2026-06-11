import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Users, ArrowLeft, HelpCircle, Zap } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { PopInView, SlideInBounceView, FloatingView, PulseView } from '../components/BouncyAnimations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameplayRouteProp = RouteProp<RootStackParamList, 'Gameplay'>;

export const GameplayScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameplayRouteProp>();
  const { players, spies, secretWord, categoryName, categoryId } = route.params;

  const handleEndQuestions = () => {
    hapticSuccess();
    navigation.navigate('Vote', {
      players,
      spies,
      secretWord,
      categoryName,
      categoryId,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header without animations */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <PopInView delay={50}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>❓ مرحلة الأسئلة</Text>
          </PopInView>
        </View>
        <PopInView delay={150}>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            اسألوا بعضكم البعض لكشف الجاسوس
          </Text>
        </PopInView>
      </View>

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
