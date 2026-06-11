import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PopInView, FloatingView } from './BouncyAnimations';

// ----- Empty State -----
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  delay?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, delay = 150 }) => {
  const { colors } = useTheme();

  return (
    <PopInView delay={delay}>
      <View style={styles.emptyContainer}>
        <FloatingView distance={8} duration={2500}>
          <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.accent}15` }]}>
            {icon}
          </View>
        </FloatingView>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
    </PopInView>
  );
};

// ----- Stat Item -----
interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

// ----- Stats Card (2 items) -----
interface StatsCardProps {
  items: [StatItemProps, StatItemProps];
  delay?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ items, delay = 100 }) => {
  const { colors } = useTheme();

  return (
    <PopInView delay={delay}>
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statItem}>
          {items[0].icon}
          <Text style={[styles.statValue, { color: colors.text }]}>{items[0].value}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{items[0].label}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          {items[1].icon}
          <Text style={[styles.statValue, { color: colors.text }]}>{items[1].value}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>{items[1].label}</Text>
        </View>
      </View>
    </PopInView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsCard: {
    flexDirection: 'row-reverse',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  statDivider: {
    width: 1.5,
    height: 48,
  },
});
