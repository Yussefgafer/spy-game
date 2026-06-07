import * as SQLite from 'expo-sqlite';

// فتح قاعدة البيانات محلياً باسم spy.db
const db = SQLite.openDatabaseSync('spy.db');

export interface Player {
  id: number;
  name: string;
  total_points: number;
  matches_played: number;
  spy_count: number;
  spy_wins: number;
}

export interface Match {
  id: number;
  date: string;
  category: string;
  secret_word: string;
  spy_names: string;
  winner: string;
  points_pool: number;
  details?: MatchDetail[];
}

export interface MatchDetail {
  match_id: number;
  player_name: string;
  role: string;
  voted_correctly: number;
  points_gained: number;
}

/**
 * تهيئة الجداول في قاعدة البيانات عند إقلاع التطبيق
 */
export const initDB = () => {
  try {
    db.execSync(`
      PRAGMA foreign_keys = ON;
      
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        total_points INTEGER DEFAULT 0,
        matches_played INTEGER DEFAULT 0,
        spy_count INTEGER DEFAULT 0,
        spy_wins INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        secret_word TEXT NOT NULL,
        spy_names TEXT NOT NULL,
        winner TEXT NOT NULL,
        points_pool INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS match_details (
        match_id INTEGER,
        player_name TEXT NOT NULL,
        role TEXT NOT NULL,
        voted_correctly INTEGER DEFAULT 0,
        points_gained INTEGER DEFAULT 0,
        FOREIGN KEY(match_id) REFERENCES matches(id) ON DELETE CASCADE
      );
    `);
    // Database initialized successfully
  } catch (error) {
    console.error('خطأ أثناء تهيئة قاعدة البيانات:', error);
  }
};

/**
 * إضافة لاعب جديد لقاعدة البيانات
 */
export const addPlayer = (name: string): Player | null => {
  try {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    db.runSync(
      'INSERT OR IGNORE INTO players (name) VALUES (?);',
      [trimmedName]
    );

    const result = db.getFirstSync<Player>(
      'SELECT * FROM players WHERE name = ?;',
      [trimmedName]
    );
    return result;
  } catch (error) {
    console.error('خطأ أثناء إضافة لاعب جديد:', error);
    return null;
  }
};

/**
 * البحث عن لاعبين بالاقتراحات (Auto-complete)
 */
export const searchPlayers = (query: string): Player[] => {
  try {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const results = db.getAllSync<Player>(
      'SELECT * FROM players WHERE name LIKE ? LIMIT 5;',
      [`%${trimmedQuery}%`]
    );
    return results;
  } catch (error) {
    console.error('خطأ أثناء البحث عن لاعبين:', error);
    return [];
  }
};

/**
 * جلب قائمة المتصدرين مرتبة تنازلياً حسب النقاط
 */
export const getLeaderboard = (): Player[] => {
  try {
    const results = db.getAllSync<Player>(
      'SELECT * FROM players ORDER BY total_points DESC;'
    );
    return results;
  } catch (error) {
    console.error('خطأ أثناء جلب قائمة المتصدرين:', error);
    return [];
  }
};

/**
 * جلب تاريخ المباريات بالكامل مع تفاصيل كل مباراة
 */
export const getHistory = (): Match[] => {
  try {
    const matches = db.getAllSync<Match>(
      'SELECT * FROM matches ORDER BY date DESC;'
    );

    const historyWithDetails = matches.map((match) => {
      const details = db.getAllSync<MatchDetail>(
        'SELECT * FROM match_details WHERE match_id = ?;',
        [match.id]
      );
      return { ...match, details };
    });

    return historyWithDetails;
  } catch (error) {
    console.error('خطأ أثناء جلب تاريخ المباريات:', error);
    return [];
  }
};

/**
 * حفظ نتيجة مباراة جديدة وتحديث إحصائيات اللاعبين في Transaction واحدة
 */
export const saveMatchResult = (
  category: string,
  secretWord: string,
  spyNames: string[],
  winner: 'SPY' | 'PLAYERS',
  pointsPool: number,
  playersDetails: {
    name: string;
    role: 'SPY' | 'PLAYER';
    votedCorrectly: boolean;
    pointsGained: number;
  }[]
): boolean => {
  try {
    // بدء الـ Transaction يدوياً لضمان سلامة البيانات
    db.execSync('BEGIN TRANSACTION;');

    const dateStr = new Date().toISOString();
    const spyNamesStr = spyNames.join('، ');

    // 1. حفظ المباراة في جدول matches
    const matchInsertResult = db.runSync(
      `INSERT INTO matches (date, category, secret_word, spy_names, winner, points_pool) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [dateStr, category, secretWord, spyNamesStr, winner, pointsPool]
    );

    const matchId = matchInsertResult.lastInsertRowId;

    // 2. حفظ تفاصيل اللاعبين وتحديث إحصائياتهم التراكمية
    for (const player of playersDetails) {
      // أ. حفظ التفاصيل في جدول match_details
      db.runSync(
        `INSERT INTO match_details (match_id, player_name, role, voted_correctly, points_gained) 
         VALUES (?, ?, ?, ?, ?);`,
        [
          matchId,
          player.name,
          player.role,
          player.votedCorrectly ? 1 : 0,
          player.pointsGained,
        ]
      );

      // ب. تحديث جدول players التراكمي
      const isSpy = player.role === 'SPY';
      const isWinner = (isSpy && winner === 'SPY') || (!isSpy && winner === 'PLAYERS');

      db.runSync(
        `UPDATE players 
         SET total_points = total_points + ?,
             matches_played = matches_played + 1,
             spy_count = spy_count + ?,
             spy_wins = spy_wins + ?
         WHERE name = ?;`,
        [
          player.pointsGained,
          isSpy ? 1 : 0,
          (isSpy && isWinner) ? 1 : 0,
          player.name,
        ]
      );
    }

    db.execSync('COMMIT;');
    // Match result saved and player stats updated successfully
    return true;
  } catch (error) {
    db.execSync('ROLLBACK;');
    console.error('خطأ أثناء حفظ نتيجة المباراة (تم عمل Rollback):', error);
    return false;
  }
};

/**
 * مسح قاعدة البيانات بالكامل (إعادة ضبط المصنع)
 */
export const clearDatabase = (): boolean => {
  try {
    db.execSync(`
      DROP TABLE IF EXISTS match_details;
      DROP TABLE IF EXISTS matches;
      DROP TABLE IF EXISTS players;
    `);
    initDB();
    // Database cleared and reinitialized successfully
    return true;
  } catch (error) {
    console.error('خطأ أثناء مسح قاعدة البيانات:', error);
    return false;
  }
};
