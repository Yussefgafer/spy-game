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
  };
  Results: {
    players: string[];
    spies: string[];
    secretWord: string;
    categoryName: string;
    categoryId: string;
    correctVoters: string[];
    spyGuessedCorrectly: boolean;
  };
  Leaderboard: undefined;
  History: undefined;
  Settings: undefined;
};
