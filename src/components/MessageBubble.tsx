import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { type ChatMessage } from '../types/chat';
import { fonts } from '../theme';

export const MessageBubble = memo(function MessageBubble({
  message,
  animate,
}: {
  message: ChatMessage;
  animate: boolean;
}) {
  const reduced = useReducedMotion();
  const own = message.role === 'user';
  const progress = useSharedValue(animate ? 0 : 1);
  useEffect(() => {
    progress.set(
      withTiming(1, {
        duration: reduced ? 100 : 220,
        easing: Easing.out(Easing.cubic),
      }),
    );
    return () => cancelAnimation(progress);
  }, [progress, reduced]);
  const motion = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: reduced ? 0 : 8 * (1 - progress.value) }],
  }));
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Animated.View style={[styles.row, own && styles.ownRow, motion]}>
      <View
        style={[styles.bubble, own && styles.ownBubble]}
        testID={own ? 'user-bubble' : 'assistant-bubble'}
      >
        <Text
          style={[styles.text, own && styles.ownText]}
          testID={own ? 'user-text' : 'reply-text'}
        >
          {message.text}
        </Text>
      </View>
      <Text style={styles.meta}>
        {own ? 'You' : 'Murmur'} · {time}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start', marginBottom: 22 },
  ownRow: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '88%',
    backgroundColor: '#F1F3F6',
    borderRadius: 18,
    borderBottomLeftRadius: 5,
    paddingHorizontal: 17,
    paddingVertical: 13,
  },
  ownBubble: {
    backgroundColor: '#202B3D',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 5,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 25,
    color: '#252C38',
  },
  ownText: { color: '#FFFFFF' },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#858D99',
    marginTop: 7,
    marginHorizontal: 3,
  },
});
