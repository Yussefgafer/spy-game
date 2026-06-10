import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { PopInView, FloatingView } from '../components/BouncyAnimations';
import { SafePressable } from '../components/SafePressable';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SpyIdentify'>;
type SpyIdentifyRouteProp = RouteProp<RootStackParamList, 'SpyIdentify'>;

export const SpyIdentifyScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SpyIdentifyRouteProp>();
  
  const { spyName, secretWord, categoryName, categoryId, players, spies } = route.params;
  
  const [inputValue, setInputValue] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleContinue = () => {
    if (inputValue.trim().toLowerCase() === spyName.toLowerCase()) {
      hapticSuccess();
      navigation.navigate('SpyGuess', {
        spyName,
        secretWord,
        categoryName,
        categoryId,
        players,
        spies,
      });
    } else {
      hapticLight();
      // خطأ — أعد المحاولة
    }
  };

  const isValidInput = inputValue.trim().length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header without animations */}
      <View style={styles.header}>
        <PopInView delay={50}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>🕵️ من أنت؟</Text>
        </PopInView>
        <PopInView delay={100}>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            اكتب اسمك لتبدأ مهمتك
          </Text>
        </PopInView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <PopInView delay={150}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>أدخل اسمك:</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="اسمك هنا..."
                placeholderTextColor={colors.textMuted}
                value={inputValue}
                onChangeText={setInputValue}
                maxLength={30}
              />
            </View>

            {/* Hint Button */}
            <SafePressable
              onPress={() => setShowHint(!showHint)}
              threshold={40}
              style={[styles.hintButton, { borderColor: colors.accentMuted }]}
            >
              {showHint ? (
                <EyeOff size={18} color={colors.accent} />
              ) : (
                <Eye size={18} color={colors.accent} />
              )}
              <Text style={[styles.hintButtonText, { color: colors.accent }]}>
                {showHint ? 'إخفاء التلميح' : 'إظهار التلميح'}
              </Text>
            </SafePressable>

            {showHint && (
              <View style={[styles.hintBox, { backgroundColor: `${colors.accent}15`, borderColor: colors.accent }]}>
                <Text style={[styles.hintText, { color: colors.accent }]}>
                  💡 الكلمة السرية: <Text style={{ fontWeight: '700' }}>{secretWord}</Text>
                </Text>
              </View>
            )}
          </View>
        </PopInView>

        {/* Warning */}
        <PopInView delay={250}>
          <View style={[styles.warningBox, { backgroundColor: `${colors.danger}10`, borderColor: colors.danger }]}>
            <Text style={[styles.warningText, { color: colors.danger }]}>
              ⚠️ لا تخبر أحداً باسمك! لن يراه اللاعبون الآخرون.
            </Text>
          </View>
        </PopInView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <SafePressable
          onPress={handleContinue}
          disabled={!isValidInput}
          threshold={40}
          style={[
            styles.continueButton,
            {
              backgroundColor: isValidInput ? colors.accent : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.continueButtonText,
              { color: isValidInput ? '#000' : colors.textMuted },
            ]}
          >
            التالي →
          </Text>
        </SafePressable>
      </View>
    </View>
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
  headerSubtitle: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
    gap: 16,
  },
  card: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    gap: 8,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  hintButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  hintButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hintBox: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  warningBox: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  continueButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
