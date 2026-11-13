import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Mic, Square } from 'lucide-react-native';
import Animated, {
  cancelAnimation, Easing, interpolate, useAnimatedStyle, useReducedMotion,
  useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';
import { type Stage } from '../hooks/useConversation';
import { Touch } from './Touch';

type Props = { stage: Stage; onPress: () => void };

function Ripple({ active, delay }: { active: boolean; delay: number }) {
  const progress = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!active || reduced) {
      cancelAnimation(progress);
      progress.value = 0;
      return;
    }
    const timer = setTimeout(() => {
      progress.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.quad) }), -1, false);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimation(progress); };
  }, [active, delay, progress, reduced]);
  const animated = useAnimatedStyle(() => ({
    opacity: active && !reduced ? interpolate(progress.value, [0, 0.15, 1], [0, 0.38, 0]) : 0,
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.75, 1.25]) }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.ripple, animated]} />;
}

function Orbit({ thinking }: { thinking: boolean }) {
  const rotation = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (thinking && !reduced) {
      rotation.value = withRepeat(withTiming(360, { duration: 2600, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
    return () => cancelAnimation(rotation);
  }, [thinking, reduced, rotation]);
  const animated = useAnimatedStyle(() => ({
    opacity: withTiming(thinking ? 1 : 0, { duration: 250 }),
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return <Animated.View pointerEvents="none" style={[styles.orbit, animated]}>
    <View style={styles.orbitDot} /><View style={styles.orbitDotSmall} />
  </Animated.View>;
}

export function VoiceOrb({ stage, onPress }: Props) {
  const listening = stage === 'listening';
  const thinking = stage === 'thinking' || stage === 'responding';
  const completed = stage === 'replied';
  const reduced = useReducedMotion();
  const breath = useSharedValue(0);
  const active = useSharedValue(0);
  useEffect(() => {
    if (!reduced) breath.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(breath);
  }, [breath, reduced]);
  useEffect(() => { active.value = withTiming(listening ? 1 : 0, { duration: 600 }); }, [active, listening]);
  const orb = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breath.value * (listening ? 0.035 : 0.018) }] }));
  const inner = useAnimatedStyle(() => ({
    opacity: 0.72 + breath.value * 0.28,
    transform: [{ translateY: -7 + breath.value * 12 }, { rotate: `${-25 + breath.value * 22}deg` }],
  }));
  const halo = useAnimatedStyle(() => ({
    opacity: 0.35 + active.value * 0.3,
    transform: [{ scale: 1 + breath.value * 0.035 + active.value * 0.035 }],
  }));
  return (
    <View style={styles.stage}>
      <View style={styles.fineRing} /><View style={styles.fineRingInner} />
      <Animated.View style={[styles.halo, halo]} />
      <Ripple active={listening} delay={0} /><Ripple active={listening} delay={850} />
      <Orbit thinking={thinking} />
      <Animated.View style={orb}>
        <Touch testID="voice-button" accessibilityRole="button"
          accessibilityLabel={listening ? 'Finish voice demo' : completed ? 'Start another voice demo' : 'Start voice demo'}
          accessibilityHint="Plays a simulated voice conversation. Microphone access is not needed."
          accessibilityState={{ disabled: thinking, busy: thinking }} disabled={thinking} onPress={onPress}
          style={({ pressed }) => [styles.orb, pressed && !thinking && styles.orbHover]}>
          <LinearGradient colors={['#B9D7A5', '#6A9A77', '#2B584A', '#203F37']} locations={[0, 0.32, 0.72, 1]}
            start={{ x: 0.15, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
          <Animated.View pointerEvents="none" style={[styles.luminous, inner]}>
            <LinearGradient colors={['#E9F8B9', '#B8E1A3', '#72A78C00']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <View pointerEvents="none" style={styles.orbInnerRing} />
          <View pointerEvents="none" style={styles.iconDisc}>
            {listening ? <Square size={19} color="#F5FFEB" fill="#F5FFEB" strokeWidth={0} />
              : completed ? <Check size={29} color="#F5FFEB" strokeWidth={1.6} />
                : <Mic size={29} color="#F5FFEB" strokeWidth={1.5} />}
          </View>
        </Touch>
      </Animated.View>
      <View pointerEvents="none" style={styles.sparkleOne} /><View pointerEvents="none" style={styles.sparkleTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { height: 226, width: 280, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  fineRing: { position: 'absolute', width: 226, height: 226, borderRadius: 113, borderWidth: 1, borderColor: '#DDE4D7' },
  fineRingInner: { position: 'absolute', width: 194, height: 194, borderRadius: 97, borderWidth: 1, borderColor: '#E4E9DE' },
  halo: { position: 'absolute', width: 176, height: 176, borderRadius: 88, backgroundColor: '#CBDDBC' },
  ripple: { position: 'absolute', width: 230, height: 230, borderRadius: 115, borderWidth: 1.3, borderColor: '#6E9E6B' },
  orb: { width: 156, height: 156, borderRadius: 78, overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0px 12px 28px rgba(43,79,51,0.22), inset 0px 1px 1px rgba(255,255,255,0.6)' },
  orbHover: { boxShadow: '0px 14px 40px rgba(43,79,51,0.3)' },
  luminous: { position: 'absolute', width: 184, height: 145, borderRadius: 85, top: -47, left: -35, overflow: 'hidden' },
  orbInnerRing: { position: 'absolute', inset: 5, borderRadius: 78, borderWidth: 0.7, borderColor: '#FFFFFF27' },
  iconDisc: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#FFFFFF12', borderWidth: 1, borderColor: '#FFFFFF26', alignItems: 'center', justifyContent: 'center' },
  orbit: { position: 'absolute', width: 214, height: 214, borderRadius: 107, borderWidth: 1, borderColor: '#7F9C6866' },
  orbitDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.forest, position: 'absolute', top: -4, left: 103 },
  orbitDotSmall: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#8EAD71', position: 'absolute', bottom: -3, left: 103 },
  sparkleOne: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: '#AEC29C', top: 40, right: 46 },
  sparkleTwo: { position: 'absolute', width: 3, height: 3, borderRadius: 2, backgroundColor: '#A6B996', bottom: 45, left: 40 },
});
