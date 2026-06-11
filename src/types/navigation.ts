export type RootStackParamList = {
  Home: undefined;
  Setup: undefined;
  Reveal: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
  };
  Gameplay: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
  };
  SpyReveal: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
    correctVoters: string[];
  };
  SpyGuess: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
    correctVoters: string[];
  };
  Vote: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
  };
  Results: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
    correctVoters: string[];
    /**
     * هل خمّن الجاسوس الكلمة السرية فعلاً (دخل مرحلة SpyGuess)؟
     * - undefined: إجماع → ما في SpyGuess (كل الأبرياء صوّتوا على الجاسوس)
     * - true: خمّن صح
     * - false: خمّن خطأ أو انتهى الوقت
     */
    spyGuessedWord?: boolean;
    /**
     * الفائز النهائي.
     * - 'SPY': الجاسوس فاز (نجا من التصويت وخمّن صح)
     * - 'PLAYERS': الأبرياء فازوا (إما بالإجماع، أو لأن الجاسوس خمّن غلط)
     */
    winner: 'SPY' | 'PLAYERS';
  };
  Leaderboard: undefined;
  History: undefined;
  Settings: undefined;
};
