import { type ComponentProps } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type Props = ComponentProps<typeof Pressable>;

/** Transform feedback keeps the surrounding layout still. */
export function Touch({ children, style, ...props }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animatedStyle}>
      <Pressable {...props} style={style}
        onPressIn={event => {
          scale.set(withSpring(0.96, { damping: 18, stiffness: 320 }));
          props.onPressIn?.(event);
        }}
        onPressOut={event => {
          scale.set(withSpring(1, { damping: 16, stiffness: 270 }));
          props.onPressOut?.(event);
        }}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
