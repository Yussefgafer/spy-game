import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Modal, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Moon, Sun, Sparkles, Trash2, AlertTriangle, Check, Palette, Database, Info } from 'lucide-react-native';
import { useTheme, ThemeType, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { clearDatabase } from '../database/sqlite';
import { hapticLight, hapticWarning, hapticSuccess } from '../utils/haptics';
import { PopInView, FloatingView } from '../components/BouncyAnimations';
import { BouncyBackButton } from '../components/BouncyBackButton';
import { SafePressable } from '../components/SafePressable';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const THEME_OPTIONS: { key: ThemeType; label: string; description: string; Icon: typeof Moon; emoji: string }[] = [
  { key: 'DARK', label: 'داكن', description: 'مظهر داكن مريح للعين', Icon: Moon, emoji: '🌙' },
  { key: 'LIGHT', label: 'مضيء', description: 'مظهر فاتح تقليدي', Icon: Sun, emoji: '☀️' },
  { key: 'NEON', label: 'نيون', description: 'مظهر نيون مستقبلي', Icon: Sparkles, emoji: '✨' },
];

export const SettingsScreen: React.FC = () => {
  const { colors, theme, setTheme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearData = () => {
    hapticWarning();
    clearDatabase();
    setShowClearModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <BouncyBackButton onPress={() => navigation.goBack()} colors={colors} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>⚙️ الإعدادات</Text>
          <View style={styles.backButton} />
        </View>
      </PopInView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Theme Section */}
        <PopInView delay={100}>
          <View style={styles.sectionHeader}>
            <Palette size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>المظهر</Text>
          </View>
        </PopInView>
        
        <View style={styles.themeOptions}>
          {THEME_OPTIONS.map((option, index) => {
            const IconComponent = option.Icon;
            const isSelected = theme === option.key;

            return (
              <PopInView key={option.key} delay={150 + index * 50}>
                <BouncyThemeCard
                  option={option}
                  isSelected={isSelected}
                  IconComponent={IconComponent}
                  colors={colors}
                  onPress={() => {
                    hapticSuccess();
                    setTheme(option.key);
                  }}
                />
              </PopInView>
            );
          })}
        </View>

        {/* Data Section */}
        <PopInView delay={350}>
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Database size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>البيانات</Text>
          </View>
        </PopInView>

        <PopInView delay={400}>
          <BouncyDangerCard
            onPress={() => {
              hapticLight();
              setShowClearModal(true);
            }}
            colors={colors}
          />
        </PopInView>

        {/* About Section */}
        <PopInView delay={450}>
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Info size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>عن التطبيق</Text>
          </View>
        </PopInView>

        <PopInView delay={500}>
          <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>🕵️ لعبة الجاسوس</Text>
            <Text style={[styles.aboutVersion, { color: colors.textMuted }]}>الإصدار 1.0.0</Text>
            <Text style={[styles.aboutDesc, { color: colors.textMuted }]}>
              لعبة جماعية ممتعة حيث يحاول اللاعبون كشف الجاسوس بينهم!
            </Text>
          </View>
        </PopInView>
      </ScrollView>

      {/* Clear Data Modal */}
      <Modal visible={showClearModal} transparent animationType="fade" onRequestClose={() => setShowClearModal(false)}>
        <View style={styles.modalOverlay}>
          <PopInView>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <FloatingView distance={4} duration={2000}>
                <View style={[styles.modalIcon, { backgroundColor: `${colors.danger}20` }]}>
                  <AlertTriangle size={36} color={colors.danger} />
                </View>
              </FloatingView>
              <Text style={[styles.modalTitle, { color: colors.text }]}>⚠️ تنبيه هام</Text>
              <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
                سيتم حذف جميع اللاعبين والنقاط وتاريخ المباريات نهائياً!
              </Text>
              <View style={styles.modalButtons}>
                <BouncyModalButton
                  onPress={() => setShowClearModal(false)}
                  colors={colors}
                  label="إلغاء"
                  variant="cancel"
                />
                <BouncyModalButton
                  onPress={handleClearData}
                  colors={colors}
                  label="مسح"
                  variant="danger"
                />
              </View>
            </View>
          </PopInView>
        </View>
      </Modal>
    </View>
  );
};

// Bouncy Theme Card
interface BouncyThemeCardProps {
  option: typeof THEME_OPTIONS[0];
  isSelected: boolean;
  IconComponent: typeof Moon;
  colors: ThemeColors;
  onPress: () => void;
}

const BouncyThemeCard: React.FC<BouncyThemeCardProps> = ({ option, isSelected, IconComponent, colors, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.spring(checkScale, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
    } else {
      checkScale.setValue(0);
    }
  }, [isSelected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <SafePressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        threshold={40}
        style={[
          styles.themeCard,
          {
            backgroundColor: colors.card,
            borderColor: isSelected ? colors.accent : colors.border,
          },
        ]}
      >
        <View style={styles.themeInfo}>
          <View style={[
            styles.themeIconContainer,
            { backgroundColor: isSelected ? `${colors.accent}15` : `${colors.textMuted}10` }
          ]}>
            <IconComponent size={22} color={isSelected ? colors.accent : colors.textMuted} />
          </View>
          <View style={styles.themeTexts}>
            <Text style={[styles.themeLabel, { color: isSelected ? colors.accent : colors.text }]}>
              {option.emoji} {option.label}
            </Text>
            <Text style={[styles.themeDescription, { color: colors.textMuted }]}>
              {option.description}
            </Text>
          </View>
        </View>
        {isSelected && (
          <Animated.View style={{ transform: [{ scale: checkScale }] }}>
            <View style={[styles.checkContainer, { backgroundColor: colors.accent }]}>
              <Check size={16} color="#000" />
            </View>
          </Animated.View>
        )}
      </SafePressable>
    </Animated.View>
  );
};

// Bouncy Danger Card
interface BouncyDangerCardProps {
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyDangerCard: React.FC<BouncyDangerCardProps> = ({ onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <SafePressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        threshold={40}
        style={[styles.dangerCard, { backgroundColor: colors.card, borderColor: colors.danger }]}
      >
        <View style={styles.dangerContent}>
          <View style={[styles.dangerIconContainer, { backgroundColor: `${colors.danger}15` }]}>
            <Trash2 size={22} color={colors.danger} />
          </View>
          <Text style={[styles.dangerLabel, { color: colors.danger }]}>🗑️ مسح جميع البيانات</Text>
        </View>
        <ChevronLeft size={22} color={colors.danger} />
      </SafePressable>
    </Animated.View>
  );
};

// Bouncy Modal Button
interface BouncyModalButtonProps {
  onPress: () => void;
  colors: ThemeColors;
  label: string;
  variant: 'cancel' | 'danger';
}

const BouncyModalButton: React.FC<BouncyModalButtonProps> = ({ onPress, colors, label, variant }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.94, tension: 400, friction: 10, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <SafePressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        threshold={40}
        style={[
          styles.modalButton,
          variant === 'cancel'
            ? { borderColor: colors.border, borderWidth: 1.5 }
            : { backgroundColor: colors.danger },
        ]}
      >
        <Text style={[
          styles.modalButtonText,
          { color: variant === 'cancel' ? colors.text : '#FFF' }
        ]}>
          {label}
        </Text>
      </SafePressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeOptions: {
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  themeInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  themeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTexts: {
    alignItems: 'flex-end',
  },
  themeLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  dangerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 14,
  },
  dangerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  aboutCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aboutVersion: {
    fontSize: 13,
    marginTop: 6,
  },
  aboutDesc: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  modalIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
