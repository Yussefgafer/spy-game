import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, ViewStyle } from 'react-native';
import { StyleProp } from 'react-native';

// Spring configs
const SPRING_CONFIG = {
  bouncy: { tension: 400, friction: 10, useNativeDriver: true },
  superBouncy: { tension: 600, friction: 8, useNativeDriver: true },
  elastic: { tension: 800, friction: 12, useNativeDriver: true },
};

// Pop In Component - Elements that pop in with a bounce
interface PopInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  scale?: number;
}

export const PopInView: React.FC<PopInViewProps> = ({
  children,
  delay = 0,
  duration = 500,
  style,
  scale = 1,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: scale,
        delay,
        ...SPRING_CONFIG.superBouncy,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        delay,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        delay,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { 
        rotate: rotateAnim.interpolate({
          inputRange: [-20, 20],
          outputRange: ['-20deg', '20deg'],
        })
      },
    ],
    opacity: opacityAnim,
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// Stagger List - Items animate in one after another
interface StaggerListViewProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  style?: StyleProp<ViewStyle>;
}

export const StaggerListView: React.FC<StaggerListViewProps> = ({
  children,
  staggerDelay = 80,
  style,
}) => {
  return (
    <Animated.View style={style}>
      {React.Children.map(children, (child, index) => (
        <PopInView key={index} delay={index * staggerDelay}>
          {child}
        </PopInView>
      ))}
    </Animated.View>
  );
};

// Floating animation - gentle bobbing up and down
interface FloatingViewProps {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}

export const FloatingView: React.FC<FloatingViewProps> = ({
  children,
  duration = 3000,
  distance = 8,
  style,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const animatedStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -distance],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

// Pulse animation - for attention-grabbing elements
interface PulseViewProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  minScale = 1,
  maxScale = 1.08,
  duration = 1500,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(minScale)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: maxScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: minScale,
          duration: duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Shake animation - for feedback on error
interface ShakeViewProps {
  children: React.ReactNode;
  shake?: boolean;
  style?: StyleProp<ViewStyle>;
  onComplete?: () => void;
}

export const ShakeView: React.FC<ShakeViewProps> = ({
  children,
  shake = false,
  style,
  onComplete,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shake) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [shake]);

  return (
    <Animated.View style={[{ transform: [{ translateX: shakeAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Bounce In from bottom
interface SlideInBounceViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export const SlideInBounceView: React.FC<SlideInBounceViewProps> = ({
  children,
  delay = 0,
  style,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        ...SPRING_CONFIG.superBouncy,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        delay,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        ...SPRING_CONFIG.bouncy,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ transform: [{ translateY }, { scale }], opacity }, style]}>
      {children}
    </Animated.View>
  );
};

// Rotate bounce - spins and bounces at the same time
interface RotateBounceViewProps {
  children: React.ReactNode;
  rotate?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const RotateBounceView: React.FC<RotateBounceViewProps> = ({
  children,
  rotate = false,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let rotateLoop: Animated.CompositeAnimation | null = null;
    let scaleLoop: Animated.CompositeAnimation | null = null;

    if (rotate) {
      scaleLoop = Animated.loop(
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            ...SPRING_CONFIG.bouncy,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            ...SPRING_CONFIG.bouncy,
          }),
        ])
      );

      rotateLoop = Animated.loop(
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          scaleLoop,
        ])
      );
      rotateLoop.start();
    } else {
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
    }

    return () => {
      rotateLoop?.stop();
      scaleLoop?.stop();
    };
  }, [rotate]);

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
            { scale: scaleAnim },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Wobble - for playful interaction
interface WobbleViewProps {
  children: React.ReactNode;
  wobble?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const WobbleView: React.FC<WobbleViewProps> = ({
  children,
  wobble = false,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (wobble) {
      Animated.sequence([
        Animated.spring(rotateAnim, { toValue: 1, ...SPRING_CONFIG.bouncy }),
        Animated.spring(rotateAnim, { toValue: -1, ...SPRING_CONFIG.bouncy }),
        Animated.spring(rotateAnim, { toValue: 0.5, ...SPRING_CONFIG.bouncy }),
        Animated.spring(rotateAnim, { toValue: 0, ...SPRING_CONFIG.bouncy }),
      ]).start();
    }
  }, [wobble]);

  return (
    <Animated.View
      style={[
        {
          transform: [
            {
              rotate: rotateAnim.interpolate({
                inputRange: [-2, 2],
                outputRange: ['-5deg', '5deg'],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Squeeze - fun squeeze effect
interface SqueezeViewProps {
  children: React.ReactNode;
  squeeze?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SqueezeView: React.FC<SqueezeViewProps> = ({
  children,
  squeeze = false,
  style,
}) => {
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (squeeze) {
      Animated.parallel([
        Animated.spring(scaleX, { toValue: 0.85, ...SPRING_CONFIG.elastic }),
        Animated.spring(scaleY, { toValue: 1.15, ...SPRING_CONFIG.elastic }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleX, { toValue: 1, ...SPRING_CONFIG.superBouncy }),
        Animated.spring(scaleY, { toValue: 1, ...SPRING_CONFIG.superBouncy }),
      ]).start();
    }
  }, [squeeze]);

  return (
    <Animated.View style={[{ transform: [{ scaleX }, { scaleY }] }, style]}>
      {children}
    </Animated.View>
  );
};

export const styles = StyleSheet.create({});
