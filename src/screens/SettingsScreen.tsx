import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, ChevronLeft, Moon, Sun, Sparkles, Trash2, AlertTriangle, Check } from 'lucide-react-native';
import { useTheme, ThemeType } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { clearDatabase } from '../database/sqlite';
import { hapticLight, hapticWarning } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const THEME_OPTIONS: { key: ThemeType; label: string; description: string; Icon: typeof Moon }[] = [
  { key: 'DARK', label: 'داكن', description: 'مظهر داكن مريح', Icon: Moon },
  { key: 'LIGHT', label: 'مضيء', description: 'مظهر فاتح تقليدي', Icon: Sun },
  { key: 'NEON', label: 'نيون', description: 'مظهر نيون مستقبلي', Icon: Sparkles },
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
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronRight size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>الإعدادات</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Theme Section */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>المظهر</Text>
        <View style={styles.themeOptions}>
          {THEME_OPTIONS.map((option) => {
            const IconComponent = option.Icon;
            const isSelected = theme === option.key;

            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  hapticLight();
                  setTheme(option.key);
                }}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={styles.themeInfo}>
                  <IconComponent size={20} color={isSelected ? colors.accent : colors.textMuted} />
                  <View style={styles.themeTexts}>
                    <Text style={[styles.themeLabel, { color: isSelected ? colors.accent : colors.text }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.themeDescription, { color: colors.textMuted }]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                {isSelected && <Check size={20} color={colors.accent} />}
              </Pressable>
            );
          })}
        </View>

        {/* Data Section */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: 24 }]}>البيانات</Text>
        <Pressable
          onPress={() => {
            hapticLight();
            setShowClearModal(true);
          }}
          style={[styles.dangerCard, { backgroundColor: colors.card, borderColor: colors.danger }]}
        >
          <View style={styles.dangerContent}>
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.dangerLabel, { color: colors.danger }]}>مسح جميع البيانات</Text>
          </View>
          <ChevronLeft size={20} color={colors.danger} />
        </Pressable>
      </ScrollView>

      {/* Clear Data Modal */}
      <Modal visible={showClearModal} transparent animationType="fade" onRequestClose={() => setShowClearModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalIcon, { backgroundColor: `${colors.danger}20` }]}>
              <AlertTriangle size={32} color={colors.danger} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>تنبيه هام</Text>
            <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
              سيتم حذف جميع اللاعبين والنقاط وتاريخ المباريات نهائياً
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowClearModal(false)}
                style={[styles.modalButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>إلغاء</Text>
              </Pressable>
              <Pressable onPress={handleClearData} style={[styles.modalButton, { backgroundColor: colors.danger }]}>
                <Text style={styles.modalConfirmText}>مسح</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  themeOptions: {
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  themeInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  themeTexts: {
    alignItems: 'flex-end',
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  dangerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  dangerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  dangerLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
