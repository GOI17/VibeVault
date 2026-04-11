import { PropsWithChildren, useEffect, useRef, type ReactElement } from "react";
import { Pressable, Platform } from "react-native";
import Toast from 'react-native-toast-message';

const DOUBLE_PRESS_DELAY = 300; // time in ms to consider a double press

interface DoublePressProps extends PropsWithChildren {
  onDoublePress: () => void;
  onSinglePress?: () => void;
  action?: 'add' | 'remove';
}

export default function DoublePress({
  onDoublePress,
  onSinglePress,
  children,
  action = 'add',
}: DoublePressProps): ReactElement {
  const lastPress = useRef(0);
  const singlePressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (singlePressTimeout.current) {
        clearTimeout(singlePressTimeout.current);
      }
    };
  }, []);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPress.current < DOUBLE_PRESS_DELAY) {
      // Double press detected
      if (singlePressTimeout.current) {
        clearTimeout(singlePressTimeout.current);
        singlePressTimeout.current = null;
      }
      Toast.hide();
      onDoublePress && onDoublePress();
    } else {
      // First press
      if (onSinglePress) {
        singlePressTimeout.current = setTimeout(() => {
          onSinglePress();
          singlePressTimeout.current = null;
        }, DOUBLE_PRESS_DELAY);
      } else {
        Toast.show({
          type: 'info',
          text1: 'Double Tap to Favorite',
          text2: action === 'add' ? 'Press one more time to add to favorites' : 'Press one more time to remove from favorites',
          visibilityTime: 2000,
          position: 'top',
        });
      }
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
