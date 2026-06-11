import React from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, ArrowLeft, Sparkles } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { hapticSuccess } from '../utils/haptics';
import { PopInView, SlideInBounceView, PulseView } from '../components/BouncyAnimations';
import { useBouncyPress } from '../hooks/useBouncyPress';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SpyRevealRouteProp = RouteProp<RootStackParamList, 'SpyReveal'>;

export const SpyRevealScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SpyRevealRouteProp>();
  const { players, spies, secretWord, categoryName, categoryId, correctVoters } = route.params;

  const handleProceed = () => {
    hapticSuccess();
    navigation.navigate('SpyGuess', {
      players,
      spies,
      secretWord,
      categoryName,
      categoryId,
      correctVoters,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🔍 تم الكشف عن الجاسوس!</Text>
        </View>
      </PopInView>

      {/* Spy Card */}
      <View style={styles.centerSection}>
        <PopInView delay={150}>
          <View style={[styles.spyCard, { backgroundColor: colors.card, borderColor: colors.danger }]}>
            <PulseView maxScale={1.15} duration={1500}>
              <View style={[styles.spyIconContainer, { backgroundColor: `${colors.danger}20` }]}>
                <Eye size={48} color={colors.danger} />
              </View>
            </PulseView>
            <Text style={[styles.spyLabel, { color: colors.danger }]}>
              الجاسوس هو
            </Text>
            <Text style={[styles.spyName, { color: colors.danger }]}>
              {spies.join('، ')}
            </Text>
          </View>
        </PopInView>

        {/* Secret Word Card */}
        <PopInView delay={300}>
          <View style={[styles.wordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.wordLabel, { color: colors.textMuted }]}>
              الكلمة السرية
            </Text>
            <Text style={[styles.secretWord, { color: colors.accent }]}>
              {secretWord}
            </Text>
            <Text style={[styles.categoryHint, { color: colors.textMuted }]}>
              التصنيف: {categoryName}
            </Text>
          </View>
        </PopInView>
      </View>

      {/* Instruction */}
      <PopInView delay={450}>
        <View style={styles.instructionContainer}>
          <Text style={[styles.instructionText, { color: colors.textMuted }]}>
            مرر الهاتف للجاسوس الآن ليحاول تخمين الكلمة
          </Text>
        </View>
      </PopInView>

      {/* Proceed Button */}
      <SlideInBounceView delay={500}>
        <View style={styles.footer}>
          <BouncySpyRevealButton onPress={handleProceed} colors={colors} />
        </View>
      </SlideInBounceView>
    </View>
  );
};

interface BouncySpyRevealButtonProps {
  onPress: () => void;
  colors: ThemeColors;
}

const BouncySpyRevealButton: React.FC<BouncySpyRevealButtonProps> = ({ onPress, colors }) => {
  const { scaleAnim, handlePressIn, handlePressOut } = useBouncyPress({
    pressInScale: 0.94,
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.proceedButton,
          { backgroundColor: colors.danger, borderColor: colors.danger },
        ]}
      >
        <Sparkles size={20} color="#FFF" />
        <Text style={styles.proceedButtonText}>
          حاول معرفة الكلمة
        </Text>
        <ArrowLeft size={22} color="#FFF" />
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
    paddingTop: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  spyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
  },
  spyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  spyLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  spyName: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  wordCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  wordLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  secretWord: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryHint: {
    fontSize: 13,
    fontWeight: '600',
  },
  instructionContainer: {
    paddingBottom: 12,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 16,
  },
  proceedButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
  },
  proceedButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
