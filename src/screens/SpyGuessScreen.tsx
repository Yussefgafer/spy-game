import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../constants/words';
import { LiquidCard } from '../components/LiquidCard';

interface SpyGuessScreenProps {
  categoryId: string;
  correctWord: string;
  onSpyGuessComplete: (isCorrect: boolean) => void;
}

export const SpyGuessScreen: React.FC<SpyGuessScreenProps> = ({
  categoryId,
  correctWord,
  onSpyGuessComplete,
}) => {
  const { colors } = useTheme();
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);

  useEffect(() => {
    // جلب تصنيف الكلمات الحالي
    const category = CATEGORIES.find((c) => c.id === categoryId);
    if (!category) return;

    // جلب 5 كلمات عشوائية أخرى غير الكلمة الصحيحة
    const otherWords = category.words.filter((w) => w !== correctWord);
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 5);

    // دمج الكلمة الصحيحة مع الكلمات العشوائية ولخبطتها
    const finalWords = [...shuffledOthers, correctWord].sort(() => 0.5 - Math.random());
    setShuffledWords(finalWords);
  }, [categoryId, correctWord]);

  const handleSelect = (word: string) => {
    const isCorrect = word === correctWord;
    onSpyGuessComplete(isCorrect);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.danger }]}>فرصة الجاسوس الأخيرة! 🕵️‍♂️</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        إذا كشف الجاسوس الكلمة السرية الصحيحة، سيفوز بالجولة ويسرق كافة النقاط!
      </Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.wordsContainer}>
        {shuffledWords.map((word, index) => (
          <Pressable key={index} onPress={() => handleSelect(word)} style={styles.wordPressable}>
            <LiquidCard style={styles.wordCard}>
              <Text style={[styles.wordText, { color: colors.text }]}>{word}</Text>
            </LiquidCard>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  scroll: { flex: 1 },
  wordsContainer: { gap: 12 },
  wordPressable: { width: '100%' },
  wordCard: { height: 56, justifyContent: 'center', alignItems: 'center' },
  wordText: { fontSize: 16, fontWeight: 'bold' },
});
