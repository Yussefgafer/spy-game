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
  SpyIdentify: {
    spyName: string;
    secretWord: string;
    categoryName: string;
    categoryId: string;
    players: string[];
    spies: string[];
  };
  SpyGuess: {
    spyName: string;
    secretWord: string;
    categoryName: string;
    categoryId: string;
    players: string[];
    spies: string[];
  };
  Vote: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
    /**
     * هل خمّن الجاسوس الكلمة السرية بشكل صحيح؟
     * - undefined: لم يدخل الجاسوس مرحلة التخمين (تخطّي مباشر)
     * - true: خمّن صح
     * - false: خمّن خطأ أو انتهى الوقت
     */
    spyGuessedCorrectly?: boolean;
  };
  Results: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
    correctVoters: string[];
    /**
     * هل خمّن الجاسوس الكلمة السرية بشكل صحيح؟
     * false الافتراضي (الجاسوس لم يخمن أو خمّن خطأ).
     */
    spyGuessedCorrectly: boolean;
  };
  Leaderboard: undefined;
  History: undefined;
  Settings: undefined;
};
