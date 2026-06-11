import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { searchPlayers, addPlayer, Player } from '../database/sqlite';
import { hapticSuccess } from '../utils/haptics';
import { Plus } from 'lucide-react-native';

/**
 * AutoCompleteInput — حقل بحث مع اقتراحات تلقائية للاعبين المحفوظين.
 *
 * السلوك:
 * - يبحث في قاعدة البيانات مع debounce (150ms) لتخفيف الضغط على DB.
 * - يستثني اللاعبين المضافين بالفعل للمباراة الحالية من الاقتراحات.
 * - زر الإضافة (+) يظهر داخل الحقل فقط عند التركيز ووجود نص صالح.
 * - الإضافة تتم عبر Enter على الكيبورد أو النقر على الزر.
 * - يلتزم بإلغاء الطلبات السابقة (cancellation flag) لتفادي race conditions.
 *
 * @example
 * <AutoCompleteInput
 *   onPlayerAdded={(player) => setPlayers(prev => [...prev, player.name])}
 *   activePlayers={players}
 *   disabled={players.length >= 10}
 * />
 */
interface AutoCompleteInputProps {
  /** يُستدعى عند اختيار لاعب من الاقتراحات أو إضافة لاعب جديد */
  onPlayerAdded: (player: Player) => void;
  /** أسماء اللاعبين المضافين للمباراة (يُستثنون من الاقتراحات) */
  activePlayers: string[];
  /** نص placeholder للـ input */
  placeholder?: string;
  /** الحد الأقصى للاقتراحات المعروضة (افتراضي: 5) */
  maxSuggestions?: number;
  /** تعطيل الحقل (مثلاً عند بلوغ الحد الأقصى للاعبين) */
  disabled?: boolean;
}

const DEBOUNCE_MS = 150;
const INPUT_HEIGHT = 70;
const BUTTON_SIZE = 38;
const MAX_NAME_LENGTH = 30;
const DROPDOWN_TOP_OFFSET = 8;
const DROPDOWN_MAX_HEIGHT = 320;
const BLUR_HIDE_DELAY_MS = 200;

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  onPlayerAdded,
  activePlayers,
  placeholder = 'ابحث عن صديق أو اكتب اسم جديد...',
  maxSuggestions = 5,
  disabled = false,
}) => {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Debounced search with cancellation flag.
   * الـ flag يمنع تطبيق نتائج بحث قديمة بعد كتابة نص أحدث.
   */
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed === '') {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchPlayers(trimmed);
        if (cancelled) return;

        const filtered = results
          .filter((player) => !activePlayers.includes(player.name))
          .slice(0, maxSuggestions);

        setSuggestions(filtered);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, activePlayers, maxSuggestions]);

  /**
   * عند تعطيل المكون، نُجبر فقدان التركيز لإخفاء الـ dropdown والزر.
   */
  useEffect(() => {
    if (disabled) {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  }, [disabled]);

  /**
   * اختيار لاعب من الاقتراحات — اللاعب موجود في DB مسبقاً.
   */
  const handleSelectSuggestion = useCallback(
    (player: Player) => {
      onPlayerAdded(player);
      setQuery('');
      setSuggestions([]);
      Keyboard.dismiss();
      inputRef.current?.blur();
      hapticSuccess();
    },
    [onPlayerAdded]
  );

  /**
   * إضافة لاعب جديد للـ DB ثم إبلاغ الأب.
   * - يتجاهل الأسماء الفارغة أو المكررة.
   * - addPlayer غير متزامن ويعيد null عند الفشل.
   */
  const handleAddNew = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed || activePlayers.includes(trimmed)) return;

    const newPlayer = await addPlayer(trimmed);
    if (!newPlayer) return;

    onPlayerAdded(newPlayer);
    setQuery('');
    setSuggestions([]);
    Keyboard.dismiss();
    inputRef.current?.blur();
    hapticSuccess();
  }, [query, activePlayers, onPlayerAdded]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  /**
   * تأخير إخفاء الـ dropdown للسماح بتسجيل النقر على اقتراح قبل الاختفاء.
   */
  const handleBlur = useCallback(() => {
    setTimeout(() => setIsFocused(false), BLUR_HIDE_DELAY_MS);
  }, []);

  // ---- Derived state ----
  const trimmed = query.trim();
  const isDuplicate = activePlayers.includes(trimmed);
  const canAdd = isFocused && trimmed.length > 0 && !isDuplicate;
  const showDropdown = isFocused && suggestions.length > 0;

  return (
    <View style={styles.container}>
      {/* Input field with integrated Add button (visible only on focus) */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.card,
            borderColor: isFocused ? colors.accent : colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.text }]}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleAddNew}
          textAlign="right"
          editable={!disabled}
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="words"
          maxLength={MAX_NAME_LENGTH}
        />

        {/* Loading state */}
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        )}

        {/* Add button — only when focused and input has a valid new name */}
        {!isLoading && canAdd && (
          <Pressable
            onPress={handleAddNew}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`إضافة ${trimmed}`}
            accessibilityHint="يضيف هذا الاسم كلاعب جديد في المباراة"
            style={({ pressed }) => [
              styles.addButton,
              {
                backgroundColor: colors.accent,
                transform: [{ scale: pressed ? 0.9 : 1 }],
              },
            ]}
          >
            <Plus size={20} color="#000" strokeWidth={2.5} />
          </Pressable>
        )}
      </View>

      {/* Dropdown — existing player matches from DB */}
      {showDropdown && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <FlatList
            data={suggestions}
            keyExtractor={(item) => `player-${item.id}`}
            renderItem={({ item }) => (
              <SuggestionItem
                player={item}
                colors={colors}
                onSelect={handleSelectSuggestion}
              />
            )}
            scrollEnabled={suggestions.length > 4}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

// ----- Suggestion Item -----
interface SuggestionItemProps {
  player: Player;
  colors: ReturnType<typeof useTheme>['colors'];
  onSelect: (player: Player) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ player, colors, onSelect }) => (
  <Pressable
    onPress={() => onSelect(player)}
    style={({ pressed }) => [
      styles.suggestionItem,
      {
        borderBottomColor: colors.border,
        backgroundColor: pressed ? colors.accentMuted : 'transparent',
      },
    ]}
    accessibilityRole="button"
    accessibilityLabel={`اختيار ${player.name}`}
  >
    <View style={styles.suggestionInfo}>
      <Text style={[styles.suggestionName, { color: colors.text }]}>
        {player.name}
      </Text>
      <Text style={[styles.suggestionMeta, { color: colors.textMuted }]}>
        {player.matches_played > 0
          ? `${player.matches_played} مباراة • ${player.total_points} نقطة`
          : 'لم يلعب بعد'}
      </Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    height: INPUT_HEIGHT,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    paddingVertical: 0,
  },
  addButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loader: {
    marginLeft: 8,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: INPUT_HEIGHT + DROPDOWN_TOP_OFFSET,
    left: 0,
    right: 0,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    maxHeight: DROPDOWN_MAX_HEIGHT,
  },
  suggestionItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  suggestionMeta: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
  },
});
