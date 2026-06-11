import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { hapticLight } from '../utils/haptics';
import { ANIM_SPRING_PRESS_IN, ANIM_SPRING_PRESS_OUT, ANIM_SPRING_BOUNCY } from '../constants/animations';

/**
 * خيارات تهيئة useBouncyPress
 */
export interface UseBouncyPressOptions {
  /** مقياس الضغط (افتراضي: 0.95) */
  pressInScale?: number;
  /** تفعيل تأثير الدوران (افتراضي: false) */
  enableRotation?: boolean;
  /** قيمة الدوران عند الضغط (افتراضي: -5) */
  rotateInValue?: number;
  /** نطاق interpolation للدوران - مدخلات (افتراضي: [-10, 10]) */
  rotateInputRange?: [number, number];
  /** نطاق interpolation للدوران - مخرجات بالدرجات (افتراضي: ['-10deg', '10deg']) */
  rotateOutputRange?: [string, string];
  /** تفعيل checkScale لتأثير الاختيار (افتراضي: false) */
  enableCheckScale?: boolean;
  /** تعطيل الحركة (افتراضي: false) */
  disabled?: boolean;
  /** تفعيل الاهتزاز اللمسي عند الضغط (افتراضي: true) */
  includeHaptic?: boolean;
}

/**
 * نتيجة useBouncyPress
 */
export interface UseBouncyPressReturn {
  /** قيمة المقياس المتحركة */
  scaleAnim: Animated.Value;
  /** قيمة الدوران المتحركة (null إذا لم يُفعّل) */
  rotateAnim: Animated.Value | null;
  /** قيمة مقياس علامة الاختيار المتحركة (null إذا لم يُفعّل) */
  checkScale: Animated.Value | null;
  /** معالج حدث الضغط */
  handlePressIn: () => void;
  /** معالج حدث رفع الإصبع */
  handlePressOut: () => void;
  /** قيمة الدوران بعد interpolation (null إذا لم يُفعّل) */
  rotateInterpolate: Animated.AnimatedInterpolation<string | number> | null;
}

/**
 * Hook مخصص لتأثيرات الضغط المرنة (Bouncy Press)
 *
 * يوفر حركة المقياس والدوران وعلامة الاختيار بشكل قابل لإعادة الاستخدام,
 * بدلاً من تكرار نفس كود handlePressIn/handlePressOut في كل مكوّن.
 *
 * @example
 * // مقياس فقط (النمط الأكثر شيوعاً)
 * const { scaleAnim, handlePressIn, handlePressOut } = useBouncyPress();
 *
 * @example
 * // مقياس + دوران
 * const { scaleAnim, rotateAnim, rotateInterpolate, handlePressIn, handlePressOut } =
 *   useBouncyPress({ enableRotation: true, rotateInValue: -5 });
 *
 * @example
 * // مع علامة اختيار
 * const { scaleAnim, checkScale, handlePressIn, handlePressOut } =
 *   useBouncyPress({ enableCheckScale: true });
 */
export const useBouncyPress = (options: UseBouncyPressOptions = {}): UseBouncyPressReturn => {
  const {
    pressInScale = 0.95,
    enableRotation = false,
    rotateInValue = -5,
    rotateInputRange = [-10, 10],
    rotateOutputRange = ['-10deg', '10deg'],
    enableCheckScale = false,
    disabled = false,
    includeHaptic = true,
  } = options;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(enableRotation ? new Animated.Value(0) : null).current;
  const checkScale = useRef(enableCheckScale ? new Animated.Value(0) : null).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;

    const animations: Animated.CompositeAnimation[] = [
      Animated.spring(scaleAnim, {
        toValue: pressInScale,
        ...ANIM_SPRING_PRESS_IN,
        useNativeDriver: true,
      }),
    ];

    if (rotateAnim) {
      animations.push(
        Animated.spring(rotateAnim, {
          toValue: rotateInValue,
          ...ANIM_SPRING_BOUNCY,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();

    if (includeHaptic) {
      hapticLight();
    }
  }, [disabled, scaleAnim, pressInScale, rotateAnim, rotateInValue, includeHaptic]);

  const handlePressOut = useCallback(() => {
    const animations: Animated.CompositeAnimation[] = [
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...ANIM_SPRING_PRESS_OUT,
        useNativeDriver: true,
      }),
    ];

    if (rotateAnim) {
      animations.push(
        Animated.spring(rotateAnim, {
          toValue: 0,
          ...ANIM_SPRING_BOUNCY,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start();
  }, [scaleAnim, rotateAnim]);

  const rotateInterpolate = rotateAnim
    ? rotateAnim.interpolate({
        inputRange: rotateInputRange,
        outputRange: rotateOutputRange,
      })
    : null;

  return {
    scaleAnim,
    rotateAnim,
    checkScale,
    handlePressIn,
    handlePressOut,
    rotateInterpolate,
  };
};
