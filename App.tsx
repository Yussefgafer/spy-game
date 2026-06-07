import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { initDB } from './src/database/sqlite';
import { CATEGORIES } from './src/constants/words';

// استيراد الشاشات
import { HomeScreen } from './src/screens/HomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { GameplayScreen } from './src/screens/GameplayScreen';
import { VoteScreen } from './src/screens/VoteScreen';
import { SpyGuessScreen } from './src/screens/SpyGuessScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type ScreenType =
  | 'HOME'
  | 'SETUP'
  | 'REVEAL'
  | 'GAMEPLAY'
  | 'VOTE'
  | 'SPY_GUESS'
  | 'RESULTS'
  | 'LEADERBOARD'
  | 'HISTORY'
  | 'SETTINGS';

function MainApp() {
  const { colors } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('HOME');

  // إعدادات المباراة الجارية
  const [gameConfig, setGameConfig] = useState<{
    category: string;
    spyCount: number;
    players: string[];
  } | null>(null);

  const [spies, setSpies] = useState<string[]>([]);
  const [secretWord, setSecretWord] = useState('');
  const [correctVoters, setCorrectVoters] = useState<string[]>([]);
  const [spyGuessedCorrectly, setSpyGuessedCorrectly] = useState(false);

  // تهيئة قاعدة البيانات عند الإقلاع
  useEffect(() => {
    initDB();
  }, []);

  const handleStartGame = (config: {
    category: string;
    spyCount: number;
    players: string[];
  }) => {
    setGameConfig(config);

    // 1. اختيار الجواسيس عشوائياً
    const shuffledPlayers = [...config.players].sort(() => 0.5 - Math.random());
    const selectedSpies = shuffledPlayers.slice(0, config.spyCount);
    setSpies(selectedSpies);

    // 2. اختيار الكلمة السرية عشوائياً من التصنيف المحدد
    const categoryObj = CATEGORIES.find((c) => c.id === config.category);
    if (categoryObj) {
      const randomWord =
        categoryObj.words[Math.floor(Math.random() * categoryObj.words.length)];
      setSecretWord(randomWord);
    }

    setCorrectVoters([]);
    setSpyGuessedCorrectly(false);
    setCurrentScreen('REVEAL');
  };

  const handleNewGameSamePlayers = () => {
    if (gameConfig) {
      handleStartGame(gameConfig);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'HOME':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'SETTINGS':
        return <SettingsScreen onBack={() => setCurrentScreen('HOME')} />;
      case 'LEADERBOARD':
        return <LeaderboardScreen onBack={() => setCurrentScreen('HOME')} />;
      case 'HISTORY':
        return <HistoryScreen onBack={() => setCurrentScreen('HOME')} />;
      case 'SETUP':
        return (
          <SetupScreen
            onStartGame={handleStartGame}
            onBack={() => setCurrentScreen('HOME')}
          />
        );
      case 'REVEAL':
        if (!gameConfig) return null;
        const catObj = CATEGORIES.find((c) => c.id === gameConfig.category);
        return (
          <RevealScreen
            players={gameConfig.players}
            spies={spies}
            secretWord={secretWord}
            categoryName={catObj ? catObj.name : ''}
            onRevealComplete={() => setCurrentScreen('GAMEPLAY')}
          />
        );
      case 'GAMEPLAY':
        if (!gameConfig) return null;
        return (
          <GameplayScreen
            players={gameConfig.players}
            onEndQuestions={() => setCurrentScreen('VOTE')}
          />
        );
      case 'VOTE':
        if (!gameConfig) return null;
        return (
          <VoteScreen
            players={gameConfig.players}
            spies={spies}
            onVoteComplete={(voters) => {
              setCorrectVoters(voters);
              setCurrentScreen('SPY_GUESS');
            }}
          />
        );
      case 'SPY_GUESS':
        if (!gameConfig) return null;
        return (
          <SpyGuessScreen
            categoryId={gameConfig.category}
            correctWord={secretWord}
            onSpyGuessComplete={(isCorrect) => {
              setSpyGuessedCorrectly(isCorrect);
              setCurrentScreen('RESULTS');
            }}
          />
        );
      case 'RESULTS':
        if (!gameConfig) return null;
        return (
          <ResultsScreen
            config={gameConfig}
            spies={spies}
            secretWord={secretWord}
            correctVoters={correctVoters}
            spyGuessedCorrectly={spyGuessedCorrectly}
            onNewGame={handleNewGameSamePlayers}
            onBackToHome={() => setCurrentScreen('HOME')}
          />
        );
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
        backgroundColor={colors.background}
      />
      {renderScreen()}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
