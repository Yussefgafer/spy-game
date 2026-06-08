import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Keyboard, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Plus, X, Minus, Play } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, CATEGORIES, shuffleArray } from '../../App';
import { searchPlayers, addPlayer, Player } from '../database/sqlite';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import { loadPreferences, savePreferences } from '../utils/preferences';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SetupScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const inputRef = useRef<TextInput>(null);

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [spyCount, setSpyCount] = useState(1);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    const loadSavedPrefs = async () => {
      const prefs = await loadPreferences();
      if (prefs) {
        setPlayers(prefs.players);
        setSelectedCategory(prefs.categoryId);
        setSpyCount(prefs.spyCount);
      }
      setIsLoading(false);
    };
    loadSavedPrefs();
  }, []);

  const handleSearchPlayers = (text: string) => {
    setPlayerName(text);
    if (text.trim()) {
      const results = searchPlayers(text);
      const filtered = results.filter((p) => !players.includes(p.name));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddPlayer = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    if (players.includes(trimmedName)) {
      hapticError();
      return;
    }
    if (players.length >= 10) {
      Alert.alert('تنبيه', 'الحد الأقصى 10 لاعبين');
      return;
    }
    hapticSuccess();
    addPlayer(trimmedName);
    setPlayers([...players, trimmedName]);
    setPlayerName('');
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const handleRemovePlayer = (name: string) => {
    hapticLight();
    setPlayers(players.filter((p) => p !== name));
  };

  const handleStartGame = async () => {
    if (players.length < 3) {
      hapticError();
      Alert.alert('تنبيه', 'الحد الأدنى 3 لاعبين');
      return;
    }

    hapticSuccess();

    // Save preferences for next time
    await savePreferences({
      players,
      categoryId: selectedCategory,
      spyCount,
    });

    // Shuffle and select spies
    const shuffledPlayers = shuffleArray(players);
    const selectedSpies = shuffledPlayers.slice(0, spyCount);

    // Select secret word
    const category = CATEGORIES.find((c) => c.id === selectedCategory);
    const shuffledWords = shuffleArray(category?.words || []);
    const secretWord = shuffledWords[0];

    navigation.navigate('Reveal', {
      players,
      spies: selectedSpies,
      secretWord,
      categoryName: category?.name || '',
      categoryId: selectedCategory,
    });
  };

  const maxSpies = Math.max(1, Math.floor(players.length / 2) || 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>إعداد المباراة</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>اختر التصنيف</Text>
          <View style={styles.categoriesRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    hapticLight();
                    setSelectedCategory(cat.id);
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.card,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isSelected ? '#000' : colors.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Spy Count */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>عدد الجواسيس</Text>
          <View style={[styles.counterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              onPress={() => {
                hapticLight();
                setSpyCount(Math.max(1, spyCount - 1));
              }}
              style={styles.counterButton}
            >
              <Minus size={24} color={colors.accent} />
            </Pressable>
            <Text style={[styles.counterValue, { color: colors.text }]}>{spyCount}</Text>
            <Pressable
              onPress={() => {
                hapticLight();
                setSpyCount(Math.min(maxSpies, spyCount + 1));
              }}
              style={styles.counterButton}
            >
              <Plus size={24} color={colors.accent} />
            </Pressable>
          </View>
          <Text style={[styles.counterHint, { color: colors.textMuted }]}>
            الحد الأقصى: {maxSpies} جاسوس
          </Text>
        </View>

        {/* Add Players */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            اللاعبون ({players.length}/10)
          </Text>
          
          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
              ]}
              value={playerName}
              onChangeText={handleSearchPlayers}
              placeholder="اكتب اسم اللاعب..."
              placeholderTextColor={colors.textMuted}
              textAlign="right"
              onSubmitEditing={() => handleAddPlayer(playerName)}
              returnKeyType="done"
            />
            <Pressable
              onPress={() => handleAddPlayer(playerName)}
              style={[styles.addButton, { backgroundColor: colors.accent }]}
            >
              <Plus size={20} color="#000" />
            </Pressable>
          </View>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {suggestions.map((player) => (
                <Pressable
                  key={player.id}
                  onPress={() => handleAddPlayer(player.name)}
                  style={styles.suggestionItem}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{player.name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Players List */}
          <View style={styles.playersList}>
            {players.map((player, index) => (
              <View
                key={index}
                style={[styles.playerItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.playerName, { color: colors.text }]}>{player}</Text>
                <Pressable onPress={() => handleRemovePlayer(player)} style={styles.removeButton}>
                  <X size={18} color={colors.danger} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleStartGame}
          disabled={players.length < 3}
          style={[
            styles.startButton,
            {
              backgroundColor: players.length >= 3 ? colors.accent : colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Play size={20} color={players.length >= 3 ? '#000' : colors.textMuted} />
          <Text
            style={[
              styles.startButtonText,
              { color: players.length >= 3 ? '#000' : colors.textMuted },
            ]}
          >
            ابدأ اللعب
          </Text>
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  categoriesRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  counterRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
  },
  counterButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 24,
  },
  counterHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 100,
    elevation: 5,
  },
  suggestionItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  suggestionText: {
    fontSize: 15,
    textAlign: 'right',
  },
  playersList: {
    marginTop: 12,
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    padding: 16,
  },
  startButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
});
