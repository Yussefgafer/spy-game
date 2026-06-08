import * as SQLite from 'expo-sqlite';

// Database reference - lazy initialization
let db: SQLite.SQLiteDatabase | null = null;

const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    try {
      db = SQLite.openDatabaseSync('spy.db');
    } catch (error) {
      console.error('Failed to open database:', error);
      throw error;
    }
  }
  return db;
};

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
export const initDB = (): boolean => {
  try {
    const database = getDatabase();
    database.execSync(`
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
    return true;
  } catch (error) {
    console.error('خطأ أثناء تهيئة قاعدة البيانات:', error);
    return false;
  }
};

/**
 * إضافة لاعب جديد لقاعدة البيانات
 */
export const addPlayer = (name: string): Player | null => {
  try {
    const database = getDatabase();
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    database.runSync(
      'INSERT OR IGNORE INTO players (name) VALUES (?);',
      [trimmedName]
    );

    const result = database.getFirstSync<Player>(
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
export const searchPlayers = async (query: string): Promise<Player[]> => {
  try {
    const database = getDatabase();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const sanitized = trimmedQuery.replace(/[%_]/g, '\\$&');
    const results = await database.getAllAsync<Player>(
      'SELECT * FROM players WHERE name LIKE ? ESCAPE \'\\\\\' LIMIT 5;',
      [`%${sanitized}%`]
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
export const getLeaderboard = async (): Promise<Player[]> => {
  try {
    const database = getDatabase();
    const results = await database.getAllAsync<Player>(
      'SELECT * FROM players ORDER BY total_points DESC;'
    );
    return results;
  } catch (error) {
    console.error('خطأ أثناء جلب قائمة المتصدرين:', error);
    return [];
  }
};

/**
 * جلب تاريخ المباريات بالكامل مع تفاصيل كل مباراة — JOIN واحد بدلاً من N+1
 */
export const getHistory = async (): Promise<Match[]> => {
  try {
    const database = getDatabase();

    const rows = await database.getAllAsync<Match & MatchDetail & { md_match_id: number }>(
      `SELECT
         m.id, m.date, m.category, m.secret_word, m.spy_names, m.winner, m.points_pool,
         md.match_id AS md_match_id, md.player_name, md.role, md.voted_correctly, md.points_gained
       FROM matches m
       LEFT JOIN match_details md ON m.id = md.match_id
       ORDER BY m.date DESC;`
    );

    const matchMap = new Map<number, Match>();
    for (const row of rows) {
      if (!matchMap.has(row.id)) {
        matchMap.set(row.id, {
          id: row.id,
          date: row.date,
          category: row.category,
          secret_word: row.secret_word,
          spy_names: row.spy_names,
          winner: row.winner,
          points_pool: row.points_pool,
          details: [],
        });
      }
      if (row.md_match_id != null) {
        matchMap.get(row.id)!.details!.push({
          match_id: row.md_match_id,
          player_name: row.player_name,
          role: row.role,
          voted_correctly: row.voted_correctly,
          points_gained: row.points_gained,
        });
      }
    }

    return Array.from(matchMap.values());
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
    const database = getDatabase();
    
    // بدء الـ Transaction يدوياً لضمان سلامة البيانات
    database.execSync('BEGIN TRANSACTION;');

    const dateStr = new Date().toISOString();
    const spyNamesStr = spyNames.join('، ');

    // 1. حفظ المباراة في جدول matches
    const matchInsertResult = database.runSync(
      `INSERT INTO matches (date, category, secret_word, spy_names, winner, points_pool) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [dateStr, category, secretWord, spyNamesStr, winner, pointsPool]
    );

    const matchId = matchInsertResult.lastInsertRowId;

    // 2. حفظ تفاصيل اللاعبين وتحديث إحصائياتهم التراكمية
    for (const player of playersDetails) {
      // أ. حفظ التفاصيل في جدول match_details
      database.runSync(
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

      database.runSync(
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

    database.execSync('COMMIT;');
    return true;
  } catch (error) {
    try {
      const database = getDatabase();
      database.execSync('ROLLBACK;');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError);
    }
    console.error('خطأ أثناء حفظ نتيجة المباراة:', error);
    return false;
  }
};

/**
 * مسح قاعدة البيانات بالكامل (إعادة ضبط المصنع)
 */
export const clearDatabase = (): boolean => {
  try {
    const database = getDatabase();
    database.execSync(`
      DROP TABLE IF EXISTS match_details;
      DROP TABLE IF EXISTS matches;
      DROP TABLE IF EXISTS players;
    `);
    initDB();
    return true;
  } catch (error) {
    console.error('خطأ أثناء مسح قاعدة البيانات:', error);
    return false;
  }
};
