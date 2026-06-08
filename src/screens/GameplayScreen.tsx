import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Users, ArrowLeft, HelpCircle } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../../App';
import { hapticLight } from '../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type GameplayRouteProp = RouteProp<RootStackParamList, 'Gameplay'>;

export const GameplayScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GameplayRouteProp>();
  const { players, spies, secretWord, categoryName, categoryId } = route.params;

  const handleEndQuestions = () => {
    hapticLight();
    navigation.navigate('Vote', { players, spies, secretWord, categoryName, categoryId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>مرحلة الأسئلة</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          اسألوا بعضكم البعض لكشف الجاسوس
        </Text>
      </View>

      {/* Players */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.playersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.playersHeader}>
            <Users size={20} color={colors.accent} />
            <Text style={[styles.playersTitle, { color: colors.text }]}>اللاعبون ({players.length})</Text>
          </View>
          {players.map((player, index) => (
            <View
              key={index}
              style={[
                styles.playerItem,
                index < players.length - 1 && { borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.playerName, { color: colors.text }]}>{player}</Text>
            </View>
          ))}
        </View>

        {/* Instructions Card */}
        <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <HelpCircle size={20} color={colors.accent} />
          <Text style={[styles.instructionTitle, { color: colors.text }]}>كيف تلعب</Text>
          <Text style={[styles.instructionText, { color: colors.textMuted }]}>
            كل لاعب يسأل لاعباً آخر سؤالاً عن الكلمة السرية.{'\n'}
            حاولوا كشف الجاسوس من خلال إجاباته الغريبة!
          </Text>
        </View>
      </ScrollView>

      {/* End Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleEndQuestions}
          style={[styles.endButton, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.endButtonText}>انتهت الأسئلة</Text>
          <ArrowLeft size={20} color="#000" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  playersCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  playersHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  playerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  playerName: {
    fontSize: 16,
    textAlign: 'right',
  },
  instructionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  footer: {
    padding: 16,
  },
  endButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 10,
  },
  endButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
  },
});
