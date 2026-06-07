import React from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { clearDatabase } from '../database/sqlite';
import { LiquidCard } from '../components/LiquidCard';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { theme, setTheme, colors } = useTheme();

  const handleClearData = () => {
    Alert.alert(
      'تنبيه هام 🚨',
      'هل أنت متأكد من مسح كافة البيانات؟ سيتم حذف جميع اللاعبين وتاريخ المباريات والنقاط نهائياً ولا يمكن استعادتها!',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، امسح كل شيء',
          style: 'destructive',
          onPress: () => {
            const success = clearDatabase();
            if (success) {
              Alert.alert('تم بنجاح', 'تم مسح قاعدة البيانات وإعادة تهيئتها.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>⚙️ الإعدادات</Text>

      {/* اختيار المظهر */}
      <Text style={[styles.label, { color: colors.text }]}>مظهر التطبيق (Theme):</Text>
      <View style={styles.themesContainer}>
        {(['DARK', 'LIGHT', 'NEON'] as const).map((t) => {
          const isSelected = theme === t;
          const label = t === 'DARK' ? 'داكن 🌙' : t === 'LIGHT' ? 'مضيء ☀️' : 'نيون 🔮';
          return (
            <Pressable key={t} onPress={() => setTheme(t)} style={{ width: '100%' }}>
              <LiquidCard
                style={[
                  styles.themeCard,
                  isSelected && { borderColor: colors.accent },
                ]}
              >
                <Text style={[styles.themeText, { color: isSelected ? colors.accent : colors.text }]}>
                  {label}
                </Text>
              </LiquidCard>
            </Pressable>
          );
        })}
      </View>

      {/* مسح البيانات */}
      <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>إدارة البيانات:</Text>
      <Pressable onPress={handleClearData} style={{ width: '100%' }}>
        <LiquidCard style={[styles.dangerCard, { borderColor: colors.danger }]}>
          <Text style={[styles.dangerText, { color: colors.danger }]}>🚨 مسح كافة البيانات وإعادة الضبط</Text>
        </LiquidCard>
      </Pressable>

      <Pressable onPress={onBack} style={styles.backBtn}>
        <LiquidCard style={{ borderColor: colors.border }}>
          <Text style={[styles.backBtnText, { color: colors.text }]}>رجوع للرئيسية 🏠</Text>
        </LiquidCard>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  label: { fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-end', marginBottom: 12 },
  themesContainer: { width: '100%', gap: 12 },
  themeCard: { height: 56, justifyContent: 'center', alignItems: 'center' },
  themeText: { fontSize: 16, fontWeight: 'bold' },
  dangerCard: { height: 56, justifyContent: 'center', alignItems: 'center' },
  dangerText: { fontSize: 15, fontWeight: 'bold' },
  backBtn: { width: '100%', marginTop: 'auto', marginBottom: 20 },
  backBtnText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
});
