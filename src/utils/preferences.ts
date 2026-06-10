import AsyncStorage from '@react-native-async-storage/async-storage';

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

    return {
      players: JSON.parse(playersStr),
      categoryId,
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
export const loadLastPlayers = async (players: string[]): Promise<string[]> => {
  return players;
};
