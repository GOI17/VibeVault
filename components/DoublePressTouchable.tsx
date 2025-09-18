import React, { PropsWithChildren, useRef } from "react";
import { Pressable, Platform } from "react-native";
import Toast from 'react-native-toast-message';

const DOUBLE_PRESS_DELAY = 300; // time in ms to consider a double press

export default function DoublePress({
  onDoublePress,
  children,
  action = 'add',
}: PropsWithChildren<{ onDoublePress: () => void; action?: 'add' | 'remove' }>) {
  const lastPress = useRef(0);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPress.current < DOUBLE_PRESS_DELAY) {
      // Double press detected
      Toast.hide();
      onDoublePress && onDoublePress();
    } else {
      // First press
      Toast.show({
        type: 'info',
        text1: 'Double Tap to Favorite',
        text2: action === 'add' ? 'Press one more time to add to favorites' : 'Press one more time to remove from favorites',
        visibilityTime: 2000,
        position: 'center',
      });
    }
    lastPress.current = now;
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        { opacity: pressed ? 0.8 : 1 },
        Platform.OS === 'web' ? { cursor: 'pointer' } : undefined,
      ]}
    >
      {children}
    </Pressable>
  );
}
