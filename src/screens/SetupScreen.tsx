import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Keyboard, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, X, Minus, Play, Sparkles } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import { RootStackParamList, CATEGORIES, shuffleArray } from '../../App';
import { searchPlayers, addPlayer, Player } from '../database/sqlite';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import { loadPreferences, savePreferences } from '../utils/preferences';
import { PopInView, SlideInBounceView } from '../components/BouncyAnimations';
import { BouncyBackButton } from '../components/BouncyBackButton';

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
      <PopInView delay={50}>
        <View style={styles.header}>
          <BouncyBackButton onPress={() => navigation.goBack()} colors={colors} icon="chevronLeft" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>إعداد المباراة</Text>
          <View style={styles.backButton} />
        </View>
      </PopInView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <PopInView delay={100}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 اختر التصنيف</Text>
            <View style={styles.categoriesRow}>
              {CATEGORIES.map((cat, index) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <PopInView key={cat.id} delay={150 + index * 50} scale={1}>
                    <BouncyCategoryChip
                      label={cat.name}
                      selected={isSelected}
                      onPress={() => {
                        hapticLight();
                        setSelectedCategory(cat.id);
                      }}
                      colors={colors}
                    />
                  </PopInView>
                );
              })}
            </View>
          </View>
        </PopInView>

        {/* Spy Count */}
        <PopInView delay={300}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🕵️ عدد الجواسيس</Text>
            <View style={[styles.counterRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <BouncyCounterButton
                icon={<Minus size={28} color={colors.accent} />}
                onPress={() => {
                  hapticLight();
                  setSpyCount(Math.max(1, spyCount - 1));
                }}
                color={colors.accent}
              />
              <AnimatedCounter value={spyCount} colors={colors} />
              <BouncyCounterButton
                icon={<Plus size={28} color={colors.accent} />}
                onPress={() => {
                  hapticLight();
                  setSpyCount(Math.min(maxSpies, spyCount + 1));
                }}
                color={colors.accent}
              />
            </View>
            <Text style={[styles.counterHint, { color: colors.textMuted }]}>
              الحد الأقصى: {maxSpies} جاسوس
            </Text>
          </View>
        </PopInView>

        {/* Add Players */}
        <PopInView delay={400}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              👥 اللاعبون ({players.length}/10)
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
              <BouncyAddButton
                onPress={() => handleAddPlayer(playerName)}
                colors={colors}
              />
            </View>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={[styles.suggestionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {suggestions.map((player, index) => (
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
                <PopInView key={`${player}-${index}`} delay={index * 50}>
                  <BouncyPlayerItem
                    name={player}
                    onRemove={() => handleRemovePlayer(player)}
                    colors={colors}
                  />
                </PopInView>
              ))}
            </View>
          </View>
        </PopInView>
      </ScrollView>

      {/* Start Button */}
      <SlideInBounceView delay={500}>
        <View style={styles.footer}>
          <BouncyStartButton
            onPress={handleStartGame}
            disabled={players.length < 3}
            colors={colors}
            canStart={players.length >= 3}
          />
        </View>
      </SlideInBounceView>
    </View>
  );
};

// Bouncy Category Chip
interface BouncyCategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyCategoryChip: React.FC<BouncyCategoryChipProps> = ({ label, selected, onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.88, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1.15, tension: 500, friction: 6, useNativeDriver: true }).start(() => {
      Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 8, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0.5, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [selected]);

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { translateX: shakeAnim.interpolate({ inputRange: [-2, 2], outputRange: [-5, 5] }) },
      ],
    }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.categoryChip,
          {
            backgroundColor: selected ? colors.accent : colors.card,
            borderColor: selected ? colors.accent : colors.border,
          },
        ]}
      >
        <Text style={[styles.categoryText, { color: selected ? '#000' : colors.text }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Counter Button
interface BouncyCounterButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  color: string;
}

const BouncyCounterButton: React.FC<BouncyCounterButtonProps> = ({ icon, onPress, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.7, tension: 600, friction: 8, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1.2, tension: 500, friction: 6, useNativeDriver: true }).start(() => {
      Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 8, useNativeDriver: true }).start();
    });
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.counterButton, { backgroundColor: `${color}20` }]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};

// Animated Counter Value
interface AnimatedCounterProps {
  value: number;
  colors: ThemeColors;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.4, tension: 500, friction: 8, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 10, useNativeDriver: true }),
      ]).start();
      prevValue.current = value;
    }
  }, [value]);

  return (
    <Animated.Text style={[styles.counterValue, { color: colors.text, transform: [{ scale: scaleAnim }] }]}>
      {value}
    </Animated.Text>
  );
};

// Bouncy Add Button
interface BouncyAddButtonProps {
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyAddButton: React.FC<BouncyAddButtonProps> = ({ onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.85, tension: 400, friction: 10, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 90, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1.2, tension: 500, friction: 6, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, tension: 300, friction: 8, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(scaleAnim, { toValue: 1, tension: 400, friction: 8, useNativeDriver: true }).start();
    });
    onPress();
  };

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { rotate: rotateAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
      ],
    }}>
      <Pressable style={[styles.addButton, { backgroundColor: colors.accent }]}>
        <Plus size={24} color="#000" />
      </Pressable>
    </Animated.View>
  );
};

// Bouncy Player Item
interface BouncyPlayerItemProps {
  name: string;
  onRemove: () => void;
  colors: ThemeColors;
}

const BouncyPlayerItem: React.FC<BouncyPlayerItemProps> = ({ name, onRemove, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleRemove = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 0.5, tension: 300, friction: 10, useNativeDriver: true }),
    ]).start(() => {
      onRemove();
    });
    hapticLight();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <View style={[styles.playerItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.playerName, { color: colors.text }]}>{name}</Text>
        <Pressable onPress={handleRemove} style={styles.removeButton}>
          <X size={20} color={colors.danger} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

// Bouncy Start Button
interface BouncyStartButtonProps {
  onPress: () => void;
  disabled: boolean;
  colors: ThemeColors;
  canStart: boolean;
}

const BouncyStartButton: React.FC<BouncyStartButtonProps> = ({ onPress, disabled, colors, canStart }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, { toValue: 0.94, tension: 400, friction: 10, useNativeDriver: true }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 500, friction: 6, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.startButton,
          {
            backgroundColor: canStart ? colors.accent : colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
      >
        {canStart && <Sparkles size={20} color="#000" />}
        <Play size={20} color={canStart ? '#000' : colors.textMuted} />
        <Text style={[styles.startButtonText, { color: canStart ? '#000' : colors.textMuted }]}>
          ابدأ اللعب!
        </Text>
      </Pressable>
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
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
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
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'right',
  },
  categoriesRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 8,
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 32,
  },
  counterHint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    borderRadius: 14,
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
    marginTop: 14,
    gap: 10,
  },
  playerItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  removeButton: {
    padding: 6,
  },
  footer: {
    padding: 16,
  },
  startButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
