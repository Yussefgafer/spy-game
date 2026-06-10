import React, { useRef, useState } from 'react';
import { Pressable, PressableProps, View } from 'react-native';
import { hapticLight } from '../utils/haptics';

interface SafePressableProps extends PressableProps {
  children: React.ReactNode;
  threshold?: number; // بكسل — المسافة القصوى قبل إلغاء الضغط
}

export const SafePressable: React.FC<SafePressableProps> = ({
  children,
  threshold = 50,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const handlePressIn: PressableProps['onPressIn'] = (e) => {
    setIsPressed(true);
    startPosRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    hapticLight();
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    if (!isPressed || !startPosRef.current) {
      setIsPressed(false);
      onPressOut?.(e);
      return;
    }

    const distance = Math.sqrt(
      Math.pow(e.nativeEvent.pageX - startPosRef.current.x, 2) +
      Math.pow(e.nativeEvent.pageY - startPosRef.current.y, 2)
    );

    // إذا تحركت أكثر من threshold، لا تستدعي onPress
    if (distance > threshold) {
      setIsPressed(false);
      onPressOut?.(e);
      startPosRef.current = null;
      return;
    }

    setIsPressed(false);
    onPressOut?.(e);
    startPosRef.current = null;
  };

  const handlePress: PressableProps['onPress'] = (e) => {
    if (!isPressed || !startPosRef.current) return;

    const distance = Math.sqrt(
      Math.pow(e.nativeEvent.pageX - startPosRef.current.x, 2) +
      Math.pow(e.nativeEvent.pageY - startPosRef.current.y, 2)
    );

    // فقط استدعي onPress إذا كانت المسافة داخل threshold
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
