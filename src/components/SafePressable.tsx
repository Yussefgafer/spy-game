import React, { useRef } from 'react';
import { Pressable, PressableProps } from 'react-native';

interface SafePressableProps extends PressableProps {
  children: React.ReactNode;
  /** بكسل — المسافة القصوى قبل إلغاء الضغط */
  threshold?: number;
}

/**
 * Pressable آمن: يلغي onPress إذا تحرك الإصبع أكثر من threshold بكسل.
 *
 * الإصلاح المهم: في React Native، ترتيب الاستدعاءات عند رفع الإصبع هو:
 *   1) onPressOut
 *   2) onPress
 * لذا يجب فحص المسافة داخل onPress (وليس onPressOut) قبل استدعاء onPress الحقيقي.
 * عدم القيام بذلك يجعل onPress لا يُستدعى أبداً (الـ ref يكون null بسبب تنظيف onPressOut).
 *
 * ملاحظة: هذا المكوّن لا يضيف اهتزاز لمسي تلقائياً. استخدم useBouncyPress
 * أو hapticLight في handlePressIn الخاص بك إذا كنت تحتاج للاهتزاز.
 */
export const SafePressable: React.FC<SafePressableProps> = ({
  children,
  threshold = 50,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handlePressIn: PressableProps['onPressIn'] = (e) => {
    startPosRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    onPressOut?.(e);
  };

  const handlePress: PressableProps['onPress'] = (e) => {
    if (!startPosRef.current) {
      return;
    }

    const distance = Math.sqrt(
      Math.pow(e.nativeEvent.pageX - startPosRef.current.x, 2) +
      Math.pow(e.nativeEvent.pageY - startPosRef.current.y, 2)
    );

    // تنظيف الـ ref أولاً حتى لو أُلغي الـ press
    startPosRef.current = null;

    // استدعِ onPress فقط إذا تحرك الإصبع داخل threshold
    if (distance <= threshold) {
      onPress?.(e);
    }
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
};
