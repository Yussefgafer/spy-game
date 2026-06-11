import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';

// ErrorScreen تتعمد استخدام useColorScheme بدلاً من ThemeContext.
// ThemeContext يمكن يكون سبب الكراش نفسه، فاستخدامه هنا يسبب كراش ثاني.
// useColorScheme أمن لأنه API native من RN وما يعتمد على React context.
const ErrorScreen: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  const scheme = useColorScheme();
  const isDark = scheme !== 'light';

  const bg = isDark ? '#121212' : '#F5F5F5';
  const card = isDark ? '#1E1E1E' : '#FFFFFF';
  const textPrimary = isDark ? '#FFFFFF' : '#121212';
  const textMuted = isDark ? '#A0A0A0' : '#707070';
  const border = isDark ? '#2C2C2C' : '#E0E0E0';
  const accent = isDark ? '#00E676' : '#4CAF50';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.card, { backgroundColor: card, borderColor: border }]}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={[styles.title, { color: textPrimary }]}>حدث خطأ غير متوقع</Text>
        <Text style={[styles.message, { color: textMuted }]}>
          {message || 'خطأ غير معروف'}
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: accent }]}
          onPress={onRetry}
          accessibilityLabel="إعادة المحاولة"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>إعادة المحاولة</Text>
        </Pressable>
      </View>
    </View>
  );
};

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('=== UNCAUGHT ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack ?? '(no stack)');
    console.error('Component Stack:', errorInfo.componentStack ?? '(no component stack)');
    console.error('======================');
  }

  private handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorScreen
          message={this.state.error?.message || ''}
          onRetry={this.handleRestart}
        />
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 28,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  buttonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ErrorBoundary;
