import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { searchPlayers, addPlayer, Player } from '../database/sqlite';

interface AutoCompleteInputProps {
  onPlayerSelect: (player: Player) => void;
  onPlayerAdd: (name: string) => void;
  activePlayers: string[]; // قائمة بأسماء اللاعبين المضافين حالياً لتجنب تكرارهم
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({
  onPlayerSelect,
  onPlayerAdd,
  activePlayers,
}) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Player[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // البحث في قاعدة البيانات عند تغير النص المدخل
  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = () => {
      const dbResults = searchPlayers(query);
      // تصفية النتائج لاستبعاد اللاعبين المضافين بالفعل للمباراة الحالية
      const filtered = dbResults.filter(
        (player) => !activePlayers.includes(player.name)
      );
      setSuggestions(filtered);
    };

    // تأخير بسيط (Debounce) لتقليل الضغط على قاعدة البيانات
    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 150);

    return () => clearTimeout(delayDebounce);
  }, [query, activePlayers]);

  const handleSelectSuggestion = (player: Player) => {
    onPlayerSelect(player);
    setQuery('');
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleAddNewPlayer = () => {
    const trimmedName = query.trim();
    if (trimmedName === '') return;

    // إضافة اللاعب لقاعدة البيانات
    const newPlayer = addPlayer(trimmedName);
    if (newPlayer) {
      onPlayerAdd(trimmedName);
    } else {
      // في حال كان موجوداً بالفعل ولم يظهر بالاقتراحات لسبب ما
      onPlayerAdd(trimmedName);
    }
    setQuery('');
    setSuggestions([]);
    Keyboard.dismiss();
  };

  // التحقق مما إذا كان الاسم المكتوب جديداً تماماً وغير مضاف للمباراة
  const isNewName =
    query.trim() !== '' &&
    !suggestions.some(
      (p) => p.name.toLowerCase() === query.trim().toLowerCase()
    ) &&
    !activePlayers.includes(query.trim());

  return (
    <View style={styles.container}>
      {/* حقل الإدخال */}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.card,
            borderColor: isFocused ? colors.accent : colors.border,
          },
        ]}
        value={query}
        onChangeText={setQuery}
        placeholder="ابحث عن صديق أو اكتب اسم جديد..."
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)} // تأخير بسيط للسماح بلمس الاقتراحات
        textAlign="right"
      />

      {/* قائمة الاقتراحات المنسدلة */}
      {isFocused && (query.trim() !== '' || suggestions.length > 0) && (
        <View
          style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectSuggestion(item)}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor: pressed
                        ? colors.accentMuted
                        : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.suggestionPoints,
                      { color: colors.textMuted },
                    ]}
                  >
                    {item.total_points} نقطة
                  </Text>
                </Pressable>
              )}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* زر إضافة لاعب جديد */}
          {isNewName && (
            <Pressable
              onPress={handleAddNewPlayer}
              style={({ pressed }) => [
                styles.addNewButton,
                {
                  backgroundColor: pressed
                    ? colors.accentMuted
                    : 'transparent',
                },
              ]}
            >
              <Text style={[styles.addNewText, { color: colors.accent }]}>
                ➕ إضافة لاعب جديد باسم "{query.trim()}"
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 10,
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'System',
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    zIndex: 20,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
  suggestionPoints: {
    fontSize: 13,
    fontFamily: 'System',
  },
  addNewButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
});
