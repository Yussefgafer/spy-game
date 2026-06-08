import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { initDB } from './src/database/sqlite';
import ErrorBoundary from './src/components/ErrorBoundary';

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

import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Setup" component={SetupScreen} />
        <Stack.Screen name="Reveal" component={RevealScreen} />
        <Stack.Screen name="Gameplay" component={GameplayScreen} />
        <Stack.Screen name="Vote" component={VoteScreen} />
        <Stack.Screen name="SpyGuess" component={SpyGuessScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainApp() {
  const { colors, theme } = useTheme();
  const isDarkTheme = theme === 'DARK' || theme === 'NEON';

  useEffect(() => {
    initDB();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkTheme ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AppNavigator />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
