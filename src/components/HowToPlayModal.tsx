import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { hapticLight, hapticSelection } from '../utils/haptics';

const { width } = Dimensions.get('window');

interface TutorialStep {
  emoji: string;
  title: string;
  description: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    emoji: '🎮',
    title: 'مرحباً بك في الجاسوس!',
    description: 'لعبة جماعية ممتعة حيث يجب على اللاعبين اكتشاف الجاسوس بينهم من خلال الأسئلة الذكية.',
  },
  {
    emoji: '🕵️‍♂️',
    title: 'من هو الجاسوس؟',
    description: 'جاسوس واحد (أو أكثر) لا يعرف الكلمة السرية! مهمته هي معرفتها دون أن يكتشفه أحد.',
  },
  {
    emoji: '❓',
    title: 'مرحلة الأسئلة',
    description: 'كل لاعب يسأل لاعباً آخر سؤالاً عن الكلمة. حاولوا كشف الجاسوس من خلال إجاباته الغريبة!',
  },
  {
    emoji: '🗳️',
    title: 'مرحلة التصويت',
    description: 'بعد الأسئلة، يصوت الجميع على من يظنون أنه الجاسوس. الأبرياء الذين صوتوا صحيحاً يأخذون نقاطاً!',
  },
  {
    emoji: '🎯',
    title: 'فرصة الجاسوس الأخيرة',
    description: 'إذا كُشف الجاسوس، له فرصة أخيرة لتخمين الكلمة السرية والفوز بنصف النقاط!',
  },
  {
    emoji: '🏆',
    title: 'جمع النقاط',
    description: 'الفائزون يحصلون على نقاط. اجمع أكبر عدد من النقاط لتصبح البطل!',
  },
];

interface HowToPlayModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const goToNextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      hapticLight();
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        slideAnim.setValue(width);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      onClose();
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      hapticLight();
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    hapticSelection();
    setCurrentStep(index);
  };

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          {/* Progress Dots */}
          <View style={styles.dotsContainer}>
            {TUTORIAL_STEPS.map((_, index) => (
              <Pressable key={index} onPress={() => goToStep(index)}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: index === currentStep ? colors.accent : colors.border,
                      width: index === currentStep ? 20 : 8,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={[styles.emojiContainer, { backgroundColor: colors.accentMuted }]}>
              <Text style={styles.emoji}>{step.emoji}</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
              {step.description}
            </Text>
          </Animated.View>

          {/* Step Counter */}
          <Text style={[styles.stepCounter, { color: colors.textMuted }]}>
            {currentStep + 1} / {TUTORIAL_STEPS.length}
          </Text>

          {/* Navigation Buttons */}
          <View style={styles.buttonsContainer}>
            {currentStep > 0 ? (
              <Pressable onPress={goToPrevStep} style={styles.navButton}>
                <Text style={[styles.navButtonText, { color: colors.textMuted }]}>
                  ← السابق
                </Text>
              </Pressable>
            ) : (
              <View style={styles.navButton} />
            )}

            <Pressable
              onPress={goToNextStep}
              style={[styles.nextButton, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'ابدأ اللعب! 🎮' : 'التالي →'}
              </Text>
            </Pressable>
          </View>

          {/* Skip Button */}
          {!isLastStep && (
            <Pressable onPress={onClose} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>تخطي</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 28,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  stepCounter: {
    fontSize: 13,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1.5,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 16,
  },
  skipText: {
    fontSize: 14,
  },
});
