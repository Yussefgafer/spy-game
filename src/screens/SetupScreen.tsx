import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Play, Sparkles, Users } from 'lucide-react-native';
import { useTheme, ThemeColors } from '../context/ThemeContext';
import type { RootStackParamList } from '../types/navigation';
import { CATEGORIES } from '../constants/words';
import { shuffleArray } from '../utils/shuffle';
import type { Player } from '../database/sqlite';
import { hapticLight, hapticSuccess, hapticError } from '../utils/haptics';
import { loadPreferences, savePreferences } from '../utils/preferences';
import { PopInView, SlideInBounceView } from '../components/BouncyAnimations';
import { BouncyBackButton } from '../components/BouncyBackButton';
import { AutoCompleteInput } from '../components/AutoCompleteInput';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_PLAYERS = 10;
const MIN_PLAYERS = 3;

export const SetupScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [players, setPlayers] = useState<string[]>([]);

  useEffect(() => {
    const loadSavedPrefs = async () => {
      const prefs = await loadPreferences();
      if (prefs) {
        setPlayers(prefs.players);
        setSelectedCategory(prefs.categoryId);
      }
    };
    loadSavedPrefs();
  }, []);

  /**
   * يُستدعى من AutoCompleteInput عند اختيار/إضافة لاعب.
   * AutoCompleteInput يفلتر التكرار، لكن هنا حماية مزدوجة.
   */
  const handlePlayerAdded = (player: Player) => {
    if (players.includes(player.name)) {
      hapticError();
      return;
    }
    if (players.length >= MAX_PLAYERS) {
      Alert.alert('تنبيه', `الحد الأقصى ${MAX_PLAYERS} لاعبين`);
      return;
    }
    setPlayers((prev) => [...prev, player.name]);
  };

  const handleRemovePlayer = (name: string) => {
    hapticLight();
    setPlayers((prev) => prev.filter((p) => p !== name));
  };

  const handleStartGame = async () => {
    if (players.length < MIN_PLAYERS) {
      hapticError();
      Alert.alert('تنبيه', `الحد الأدنى ${MIN_PLAYERS} لاعبين`);
      return;
    }

    hapticSuccess();

    await savePreferences({
      players,
      categoryId: selectedCategory,
    });

    const shuffledPlayers = shuffleArray(players);
    // جاسوس واحد فقط — مؤقتاً حتى يتم دعم جواسيس متعددين
    const selectedSpies: string[] = [shuffledPlayers[0]];

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

  const isPlayersFull = players.length >= MAX_PLAYERS;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <PopInView delay={50}>
        <View style={styles.header}>
          <BouncyBackButton
            onPress={() => navigation.goBack()}
            colors={colors}
            icon="chevronLeft"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            إعداد المباراة
          </Text>
          <View style={styles.headerSpacer} />
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              🎯 اختر التصنيف
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesRow}
            >
              {CATEGORIES.map((cat, index) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <PopInView key={cat.id} delay={150 + index * 30} scale={1}>
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
            </ScrollView>
          </View>
        </PopInView>

        {/* Add Players */}
        <PopInView delay={300}>
          <View style={styles.section}>
            <View style={styles.playersHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                👥 اللاعبون
              </Text>
              <View
                style={[
                  styles.playersBadge,
                  { backgroundColor: colors.accentMuted },
                ]}
              >
                <Users size={14} color={colors.accent} strokeWidth={2.5} />
                <Text style={[styles.playersBadgeText, { color: colors.accent }]}>
                  {players.length}/{MAX_PLAYERS}
                </Text>
              </View>
            </View>

            <AutoCompleteInput
              onPlayerAdded={handlePlayerAdded}
              activePlayers={players}
              disabled={isPlayersFull}
              placeholder={
                isPlayersFull
                  ? `وصلت للحد الأقصى (${MAX_PLAYERS})`
                  : 'ابحث عن صديق أو اكتب اسم جديد...'
              }
            />

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
            disabled={players.length < MIN_PLAYERS}
            colors={colors}
            canStart={players.length >= MIN_PLAYERS}
          />
        </View>
      </SlideInBounceView>
    </View>
  );
};

// ===== Sub-components =====

interface BouncyCategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ThemeColors;
}

const BouncyCategoryChip: React.FC<BouncyCategoryChipProps> = ({
  label,
  selected,
  onPress,
  colors,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      tension: 400,
      friction: 10,
      useNativeDriver: true,
    }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.15,
      tension: 500,
      friction: 6,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 400,
        friction: 8,
        useNativeDriver: true,
      }).start();
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
  }, [selected, shakeAnim]);

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { translateX: shakeAnim.interpolate({ inputRange: [-2, 2], outputRange: [-5, 5] }) },
        ],
      }}
    >
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
        <Text style={[styles.categoryText, { color: selected ? '#000' : colors.text }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

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
      <View
        style={[
          styles.playerItem,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.playerName, { color: colors.text }]}>{name}</Text>
        <Pressable
          onPress={handleRemove}
          style={styles.removeButton}
          accessibilityRole="button"
          accessibilityLabel={`إزالة ${name}`}
        >
          <X size={20} color={colors.danger} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

interface BouncyStartButtonProps {
  onPress: () => void;
  disabled: boolean;
  colors: ThemeColors;
  canStart: boolean;
}

const BouncyStartButton: React.FC<BouncyStartButtonProps> = ({
  onPress,
  disabled,
  colors,
  canStart,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      tension: 400,
      friction: 10,
      useNativeDriver: true,
    }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 500,
      friction: 6,
      useNativeDriver: true,
    }).start();
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
        <Text
          style={[
            styles.startButtonText,
            { color: canStart ? '#000' : colors.textMuted },
          ]}
        >
          ابدأ اللعب!
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ===== Styles =====

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
  headerSpacer: {
    width: 44,
    height: 44,
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
  playersHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  playersBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  playersBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoriesRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingRight: 16,
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
