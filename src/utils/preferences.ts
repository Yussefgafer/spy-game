import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES } from '../constants/words';

const KEYS = {
  LAST_PLAYERS: 'last_players',
  LAST_CATEGORY: 'last_category',
};

export interface SavedPreferences {
  players: string[];
  categoryId: string;
}

/**
 * حفظ آخر إعدادات اللعبة
 */
export const savePreferences = async (prefs: SavedPreferences): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [KEYS.LAST_PLAYERS, JSON.stringify(prefs.players)],
      [KEYS.LAST_CATEGORY, prefs.categoryId],
    ]);
  } catch (error) {
    console.error('خطأ أثناء حفظ الإعدادات:', error);
  }
};

/**
 * تحميل آخر إعدادات اللعبة
 */
export const loadPreferences = async (): Promise<SavedPreferences | null> => {
  try {
    const values = await AsyncStorage.multiGet([
      KEYS.LAST_PLAYERS,
      KEYS.LAST_CATEGORY,
    ]);

    const playersStr = values[0][1];
    const categoryId = values[1][1];

    if (!playersStr || !categoryId) {
      return null;
    }

    // التحقق من صحة التصنيف لتجنب الانهيار بعد تعديل كلمات words.ts
    const categoryExists = CATEGORIES.some((c) => c.id === categoryId);
    const validCategoryId = categoryExists ? categoryId : CATEGORIES[0].id;

    return {
      players: JSON.parse(playersStr),
      categoryId: validCategoryId,
    };
  } catch (error) {
    console.error('خطأ أثناء تحميل الإعدادات:', error);
    return null;
  }
};

/**
 * حفظ آخر قائمة لاعبين
 */
export const saveLastPlayers = async (players: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.LAST_PLAYERS, JSON.stringify(players));
  } catch (error) {
    console.error('خطأ أثناء حفظ قائمة اللاعبين:', error);
  }
};

/**
 * تحميل آخر قائمة لاعبين
 */
export const loadLastPlayers = async (): Promise<string[]> => {
  try {
    const playersStr = await AsyncStorage.getItem(KEYS.LAST_PLAYERS);
    if (playersStr) {
      return JSON.parse(playersStr);
    }
    return [];
  } catch (error) {
    console.error('خطأ أثناء تحميل قائمة اللاعبين:', error);
    return [];
  }
};
