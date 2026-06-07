import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { useTheme, ThemeType } from '../context/ThemeContext';
import { clearDatabase } from '../database/sqlite';
import { LiquidCard } from '../components/LiquidCard';

interface SettingsScreenProps {
  onBack: () => void;
}

interface ThemeOption {
  key: ThemeType;
  label: string;
  emoji: string;
  description: string;
  previewColors: {
    background: string;
    accent: string;
    text: string;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'DARK',
    label: 'داكن',
    emoji: '🌙',
    description: 'مظهر داكن مريح للعين',
    previewColors: {
      background: '#121212',
      accent: '#00E676',
      text: '#FFFFFF',
    },
  },
  {
    key: 'LIGHT',
    label: 'مضيء',
    emoji: '☀️',
    description: 'مظهر فاتح تقليدي',
    previewColors: {
      background: '#F5F5F5',
      accent: '#4CAF50',
      text: '#121212',
    },
  },
  {
    key: 'NEON',
    label: 'نيون',
    emoji: '🔮',
    description: 'مظهر نيون مستقبلي',
    previewColors: {
      background: '#050515',
      accent: '#FF00FF',
      text: '#00FFFF',
    },
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, setTheme, colors } = useTheme();
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearData = () => {
    const success = clearDatabase();
    if (success) {
      setShowClearModal(false);
    }
  };

  const ThemeCard = ({ option }: { option: ThemeOption }) => {
    const isSelected = theme === option.key;
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Pressable
        onPress={() => setTheme(option.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: '100%' }}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View
            style={[
              styles.themeCard,
              {
                backgroundColor: colors.card,
                borderColor: isSelected ? colors.accent : colors.border,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          >
            {/* Preview Circle */}
            <View
              style={[
                styles.previewCircle,
                { backgroundColor: option.previewColors.background },
              ]}
            >
              <View
                style={[
                  styles.previewAccent,
                  { backgroundColor: option.previewColors.accent },
                ]}
              />
            </View>

            {/* Theme Info */}
            <View style={styles.themeInfo}>
              <View style={styles.themeHeader}>
                <Text style={styles.themeEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.themeLabel,
                    { color: isSelected ? colors.accent : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </View>
              <Text style={[styles.themeDescription, { color: colors.textMuted }]}>
                {option.description}
              </Text>
            </View>

            {/* Selected Indicator */}
            {isSelected && (
              <View style={[styles.selectedBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.selectedCheck}>✓</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>⚙️ الإعدادات</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          خصّص تجربتك في اللعبة
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎨 مظهر التطبيق
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            اختر المظهر المناسب لك
          </Text>

          <View style={styles.themesContainer}>
            {THEME_OPTIONS.map((option) => (
              <ThemeCard key={option.key} option={option} />
            ))}
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📊 إدارة البيانات
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            تحكم في بيانات اللعبة
          </Text>

          <Pressable
            onPress={() => setShowClearModal(true)}
            style={{ width: '100%' }}
          >
            <View
              style={[
                styles.dangerCard,
                { backgroundColor: colors.card, borderColor: colors.danger },
              ]}
            >
              <View style={styles.dangerIcon}>
                <Text style={styles.dangerEmoji}>🗑️</Text>
              </View>
              <View style={styles.dangerInfo}>
                <Text style={[styles.dangerTitle, { color: colors.danger }]}>
                  مسح جميع البيانات
                </Text>
                <Text style={[styles.dangerDescription, { color: colors.textMuted }]}>
                  حذف اللاعبين، النقاط، وتاريخ المباريات
                </Text>
              </View>
              <Text style={styles.dangerArrow}>›</Text>
            </View>
          </Pressable>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ℹ️ حول التطبيق
          </Text>

          <Pressable
            onPress={() => setShowAboutModal(true)}
            style={{ width: '100%' }}
          >
            <LiquidCard style={styles.aboutCard}>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutEmoji}>📱</Text>
                <Text style={[styles.aboutText, { color: colors.text }]}>
                  معلومات عن الجاسوس
                </Text>
                <Text style={[styles.aboutArrow, { color: colors.textMuted }]}>›</Text>
              </View>
            </LiquidCard>
          </Pressable>
        </View>
      </ScrollView>

      {/* Back Button */}
      <View style={styles.footer}>
        <Pressable onPress={onBack} style={{ width: '100%' }}>
          <LiquidCard style={[styles.backBtn, { borderColor: colors.border }]}>
            <Text style={[styles.backBtnText, { color: colors.text }]}>
              🏠 رجوع للرئيسية
            </Text>
          </LiquidCard>
        </Pressable>
      </View>

      {/* Clear Data Modal */}
      <Modal
        visible={showClearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowClearModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              تنبيه هام!
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
              سيتم حذف جميع البيانات نهائياً بما فيها:
            </Text>
            <View style={styles.modalList}>
              <Text style={[styles.modalListItem, { color: colors.textMuted }]}>
                • جميع اللاعبين والنقاط
              </Text>
              <Text style={[styles.modalListItem, { color: colors.textMuted }]}>
                • تاريخ المباريات السابقة
              </Text>
              <Text style={[styles.modalListItem, { color: colors.textMuted }]}>
                • إحصائيات المتصدرين
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowClearModal(false)}
                style={[styles.modalBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>إلغاء</Text>
              </Pressable>
              <Pressable
                onPress={handleClearData}
                style={[styles.modalBtn, { backgroundColor: colors.danger }]}
              >
                <Text style={styles.modalBtnTextWhite}>مسح الكل</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAboutModal(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: colors.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.aboutModalEmoji}>🕵️‍♂️</Text>
            <Text style={[styles.modalTitle, { color: colors.accent }]}>
              الجاسوس
            </Text>
            <Text style={[styles.versionText, { color: colors.textMuted }]}>
              الإصدار 1.0.0
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textMuted, textAlign: 'center' }]}>
              لعبة جماعية ممتعة حيث يجب على اللاعبين اكتشاف الجاسوس بينهم من خلال الأسئلة الذكية!
            </Text>
            <View style={styles.aboutFeatures}>
              <View style={styles.aboutFeature}>
                <Text style={styles.aboutFeatureEmoji}>🎮</Text>
                <Text style={[styles.aboutFeatureText, { color: colors.text }]}>لعب جماعي</Text>
              </View>
              <View style={styles.aboutFeature}>
                <Text style={styles.aboutFeatureEmoji}>🏆</Text>
                <Text style={[styles.aboutFeatureText, { color: colors.text }]}>سجل الأبطال</Text>
              </View>
              <View style={styles.aboutFeature}>
                <Text style={styles.aboutFeatureEmoji}>🎨</Text>
                <Text style={[styles.aboutFeatureText, { color: colors.text }]}>ثيمات متعددة</Text>
              </View>
            </View>
            <Pressable
              onPress={() => setShowAboutModal(false)}
              style={[styles.closeBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.closeBtnText}>حسناً 👍</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'right' },
  sectionSubtitle: { fontSize: 13, marginBottom: 12, textAlign: 'right' },
  themesContainer: { gap: 12 },
  themeCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  previewCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  previewAccent: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  themeInfo: { flex: 1 },
  themeHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
  },
  themeEmoji: { fontSize: 18, marginLeft: 8 },
  themeLabel: { fontSize: 17, fontWeight: 'bold' },
  themeDescription: { fontSize: 13 },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  dangerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  dangerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 51, 102, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  dangerEmoji: { fontSize: 20 },
  dangerInfo: { flex: 1 },
  dangerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  dangerDescription: { fontSize: 13 },
  dangerArrow: { fontSize: 24, color: '#FF3366' },
  aboutCard: { padding: 16 },
  aboutRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  aboutEmoji: { fontSize: 20, marginLeft: 12 },
  aboutText: { flex: 1, fontSize: 16, fontWeight: '600' },
  aboutArrow: { fontSize: 24 },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  backBtn: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
  },
  backBtnText: { fontSize: 16, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  modalMessage: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  modalList: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  modalListItem: { fontSize: 14, marginVertical: 4 },
  modalButtons: {
    flexDirection: 'row-reverse',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  modalBtnText: { fontSize: 15, fontWeight: 'bold' },
  modalBtnTextWhite: { fontSize: 15, fontWeight: 'bold', color: '#FFF' },

  // About Modal
  aboutModalEmoji: { fontSize: 60, marginBottom: 8 },
  versionText: { fontSize: 14, marginBottom: 16 },
  aboutFeatures: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  aboutFeature: { alignItems: 'center' },
  aboutFeatureEmoji: { fontSize: 28, marginBottom: 6 },
  aboutFeatureText: { fontSize: 13, fontWeight: '600' },
  closeBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});
