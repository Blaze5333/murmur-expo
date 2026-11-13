import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation, Easing, type SharedValue, useAnimatedStyle, useReducedMotion,
  useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

function Bar({ index, phase, active, reduced }: { index: number; phase: SharedValue<number>; active: boolean; reduced: boolean }) {
  const envelope = 0.35 + 0.65 * Math.sin((index / 26) * Math.PI);
  const style = useAnimatedStyle(() => {
    const movement = reduced ? 0.5 : (Math.sin(phase.value + index * 0.78) + 1) / 2;
    return {
      opacity: active ? 0.6 + envelope * 0.4 : 0.35,
      transform: [{ scaleY: active ? 0.2 + movement * envelope * 0.8 : 0.12 }],
    };
  });
  return <Animated.View style={[styles.bar, style]} />;
}

export function Waveform({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const phase = useSharedValue(0);
  useEffect(() => {
    if (active && !reduced) phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 1350, easing: Easing.linear }), -1, false);
    else { cancelAnimation(phase); phase.value = 0; }
    return () => cancelAnimation(phase);
  }, [active, phase, reduced]);
  return <View style={styles.wave} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {Array.from({ length: 27 }, (_, index) => <Bar key={index} index={index} phase={phase} active={active} reduced={reduced} />)}
  </View>;
}

function ThinkingDot({ index, phase }: { index: number; phase: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * ((Math.sin(phase.value - index * 0.9) + 1) / 2),
    transform: [{ translateY: -3 * ((Math.sin(phase.value - index * 0.9) + 1) / 2) }],
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function ThinkingDots() {
  const phase = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!reduced) phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 1100, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(phase);
  }, [phase, reduced]);
  return <View style={styles.dots} accessibilityLabel="Murmur is thinking">
    {[0, 1, 2].map(index => <ThinkingDot key={index} index={index} phase={phase} />)}
  </View>;
}

const styles = StyleSheet.create({
  wave: { height: 29, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  bar: { width: 3, height: 27, borderRadius: 2, backgroundColor: '#52734F' },
  dots: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.forest },
});
