import { type ComponentRef, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  MessageSquare,
  Trash2,
  X,
} from 'lucide-react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useConversation, SUGGESTIONS } from '../hooks/useConversation';
import { MessageBubble } from '../components/MessageBubble';
import { Composer } from '../components/Composer';
import { ThinkingDots, Waveform } from '../components/Waveform';
import { fonts } from '../theme';

export function ConversationScreen() {
  const {
    messages,
    ready,
    storageError,
    stage,
    transcript,
    sendText,
    startVoice,
    finishVoice,
    cancel,
    clearHistory,
  } = useConversation();
  const insets = useSafeAreaInsets();
  const list = useRef<ComponentRef<typeof ScrollView>>(null);
  const [mountedAt] = useState(Date.now);
  const following = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const reduced = useReducedMotion();

  function scrollToLatest(animated = !reduced) {
    following.current = true;
    list.current?.scrollToEnd({ animated });
  }

  // Content changes cover new messages, a typing row, and restored history.
  function onContentChange() {
    if (!following.current) return;
    const latest = messages[messages.length - 1];
    const animate = !reduced && !!latest && latest.createdAt >= mountedAt;
    requestAnimationFrame(() => {
      if (following.current) list.current?.scrollToEnd({ animated: animate });
    });
  }

  function send(text: string) {
    following.current = true;
    return sendText(text);
  }

  function clear() {
    const remove = () => {
      following.current = true;
      clearHistory();
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Clear the conversation saved on this device?'))
        remove();
    } else {
      Alert.alert(
        'Clear conversation?',
        'This removes the messages saved on this device.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: remove },
        ],
      );
    }
  }

  useEffect(() => {
    if (Platform.OS !== 'web' || !ready) return;
    if (new URLSearchParams(window.location.search).get('autoplay') !== '1')
      return;
    const timer = setTimeout(startVoice, 1000);
    return () => clearTimeout(timer);
  }, [ready, startVoice]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      enabled={Platform.OS !== 'web'}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 18) }]}>
        <View style={styles.identity}>
          <View style={styles.logo}>
            <MessageSquare size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={styles.brand}>
              murmur<Text style={styles.brandDot}>.</Text>
            </Text>
            <Text style={styles.headerNote}>A little room to talk</Text>
          </View>
        </View>
        <Pressable
          testID="reset-button"
          accessibilityRole="button"
          accessibilityLabel="Clear saved conversation"
          onPress={clear}
          disabled={!ready || messages.length === 0}
          style={({ pressed }) => [
            styles.clear,
            pressed && styles.pressed,
            messages.length === 0 && styles.dim,
          ]}
        >
          <Trash2 size={17} color="#697384" strokeWidth={1.8} />
        </Pressable>
      </View>

      {!ready ? (
        <View style={styles.loading}>
          <ActivityIndicator
            color="#315BEE"
            accessibilityLabel="Loading conversation"
          />
        </View>
      ) : (
        <View style={styles.listArea}>
          <ScrollView
            ref={list}
            testID="message-list"
            contentContainerStyle={[
              styles.messages,
              messages.length === 0 && styles.emptyList,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={onContentChange}
            onLayout={() => {
              if (following.current)
                list.current?.scrollToEnd({ animated: false });
            }}
            scrollEventThrottle={100}
            onScroll={(event) => {
              const { contentOffset, layoutMeasurement, contentSize } =
                event.nativeEvent;
              const nearBottom =
                contentSize.height -
                  layoutMeasurement.height -
                  contentOffset.y <
                80;
              following.current = nearBottom;
              setAtBottom(nearBottom);
            }}
          >
            {messages.length === 0 && (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <MessageSquare size={28} color="#315BEE" strokeWidth={1.8} />
                </View>
                <Text style={styles.title}>Let’s talk.</Text>
                <Text style={styles.description}>
                  A question, a rough idea, a busy day.{'\n'}Start with
                  whatever’s on your mind.
                </Text>
                <Text style={styles.promptLabel}>A FEW PLACES TO START</Text>
                {SUGGESTIONS.map((suggestion, index) => (
                  <Pressable
                    key={suggestion}
                    testID={'suggestion-' + index}
                    accessibilityRole="button"
                    onPress={() => send(suggestion)}
                    style={({ pressed }) => [
                      styles.suggestion,
                      pressed && styles.suggestionPressed,
                    ]}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <ArrowUpRight size={17} color="#7B8595" />
                  </Pressable>
                ))}
              </View>
            )}
            {messages.length > 0 && (
              <Text style={styles.historyLabel}>YOUR CONVERSATION</Text>
            )}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                animate={message.createdAt >= mountedAt}
              />
            ))}
            {stage === 'thinking' ? (
              <View style={styles.thinking}>
                <ThinkingDots />
                <Text testID="status-label" style={styles.thinkingText}>
                  Murmur is typing
                </Text>
              </View>
            ) : undefined}
          </ScrollView>
          {!atBottom && messages.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scroll to latest messages"
              testID="latest-button"
              onPress={() => scrollToLatest(false)}
              style={styles.latest}
            >
              <ArrowDown size={15} color="#FFFFFF" />
              <Text style={styles.latestText}>Latest messages</Text>
            </Pressable>
          )}
        </View>
      )}

      {stage === 'listening' && (
        <View style={styles.recording}>
          <View style={styles.recordingTop}>
            <Text testID="status-label" style={styles.recordingLabel}>
              Voice preview · simulated
            </Text>
            <Pressable
              testID="cancel-button"
              accessibilityRole="button"
              accessibilityLabel="Cancel voice demo"
              onPress={cancel}
              hitSlop={12}
            >
              <X size={18} color="#697384" />
            </Pressable>
          </View>
          <View style={styles.recordingBody}>
            <Waveform active />
            <Text testID="transcript" style={styles.transcript}>
              {transcript || 'Listening…'}
            </Text>
          </View>
          <Pressable
            testID="finish-voice-button"
            accessibilityRole="button"
            onPress={() => {
              following.current = true;
              finishVoice();
            }}
            style={styles.useVoice}
          >
            <Text style={styles.useVoiceText}>Use message</Text>
            <Check size={15} color="#315BEE" />
          </Pressable>
        </View>
      )}

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <Composer
          ready={ready}
          busy={stage !== 'idle'}
          onSend={send}
          onVoice={() => {
            following.current = true;
            startVoice();
          }}
          onCancel={cancel}
        />
        <Text
          style={[styles.storageNote, storageError && styles.storageError]}
          accessibilityLiveRegion="polite"
        >
          {storageError
            ? 'History couldn’t be saved. Check your device storage.'
            : 'Demo replies · Saved on this device'}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#202B3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontFamily: fonts.bold,
    fontWeight: '800',
    fontSize: 23,
    letterSpacing: -0.8,
    color: '#191D24',
  },
  brandDot: { color: '#315BEE' },
  headerNote: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#818996',
    marginTop: 2,
  },
  clear: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dim: { opacity: 0.35 },
  pressed: { backgroundColor: '#F1F3F6' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listArea: { flex: 1, minHeight: 0 },
  messages: { paddingHorizontal: 22, paddingTop: 24, paddingBottom: 16 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingTop: 20,
    paddingBottom: 28,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#EEF2FF',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.bold,
    fontWeight: '700',
    fontSize: 36,
    letterSpacing: -1.4,
    color: '#191D24',
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    color: '#77808F',
    marginTop: 12,
    marginBottom: 35,
  },
  promptLabel: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 1.25,
    color: '#929AA7',
    marginBottom: 12,
  },
  suggestion: {
    minHeight: 54,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E8EE',
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  suggestionPressed: { borderColor: '#BDC9F5', backgroundColor: '#F5F7FF' },
  suggestionText: {
    fontFamily: fonts.medium,
    fontWeight: '500',
    fontSize: 14,
    color: '#414B5B',
  },
  historyLabel: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 1.3,
    color: '#929AA7',
    marginBottom: 27,
    textAlign: 'center',
  },
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  thinkingText: { fontFamily: fonts.medium, fontSize: 12, color: '#808998' },
  latest: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#202B3D',
    boxShadow: '0 3px 12px rgba(20,30,50,0.12)',
  },
  latestText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',
  },
  storageNote: {
    fontFamily: fonts.regular,
    fontSize: 10,
    textAlign: 'center',
    color: '#929AA7',
    marginTop: 10,
    lineHeight: 16,
  },
  storageError: { color: '#AF5C28' },
  recording: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#DCE3FC',
  },
  recordingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordingLabel: {
    fontFamily: fonts.medium,
    fontWeight: '600',
    fontSize: 12,
    color: '#617198',
  },
  recordingBody: { alignItems: 'center', gap: 12, paddingVertical: 14 },
  transcript: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: '#29364B',
    textAlign: 'center',
  },
  useVoice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 6,
  },
  useVoiceText: {
    fontFamily: fonts.semibold,
    fontWeight: '600',
    fontSize: 12,
    color: '#315BEE',
  },
});
