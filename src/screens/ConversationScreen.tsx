import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUp, ArrowUpRight, Check, Leaf, RotateCcw, X } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { colors, fonts } from '../theme';
import { type Stage, SUGGESTIONS, useConversation } from '../hooks/useConversation';
import { Brand } from '../components/Brand';
import { Touch } from '../components/Touch';
import { VoiceOrb } from '../components/VoiceOrb';
import { ThinkingDots, Waveform } from '../components/Waveform';

const status: Record<Stage, string> = {
  idle: 'A thought starts with a word.', listening: 'I’m listening.', thinking: 'A moment to reflect…',
  responding: 'Finding the right words…', replied: 'A little lighter, together.',
};

export function ConversationScreen({ framed = false }: { framed?: boolean }) {
  const conversation = useConversation();
  const { stage, transcript, prompt, reply, turn, startVoice, finishVoice, sendText, reset } = conversation;
  const [input, setInput] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [focused, setFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const reduced = useReducedMotion();
  const listening = stage === 'listening';
  const busy = listening || stage === 'thinking' || stage === 'responding';
  const canSend = input.trim().length > 0 && !busy;
  const enter = reduced ? FadeIn.duration(100) : FadeInDown.springify().damping(20).stiffness(185).mass(0.75);

  useEffect(() => {
    if (!listening) return;
    const timer = setInterval(() => setElapsed(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [listening]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autoplay') !== '1') return;
    const timer = setTimeout(startVoice, 1200);
    return () => clearTimeout(timer);
  }, [startVoice]);

  function submit(text = input) {
    if (sendText(text)) {
      setInput('');
      Keyboard.dismiss();
      inputRef.current?.blur();
    }
  }

  function replay() {
    reset();
    setElapsed(0);
    setInput('');
    Keyboard.dismiss();
  }

  function beginVoice() {
    setElapsed(0);
    startVoice();
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <View style={[styles.header, { paddingTop: framed ? 12 : Math.max(insets.top, 20) }]}>
        <Brand small />
        <Touch testID="reset-button" accessibilityRole="button" accessibilityLabel="Reset conversation" onPress={replay} style={styles.reset}>
          <RotateCcw size={16} color={colors.muted} strokeWidth={1.6} />
        </Touch>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.eyebrowRow}><View style={styles.tinyDot} /><Text style={styles.eyebrow}>A MOMENT, JUST FOR YOU</Text></View>
          <Text accessibilityRole="header" style={styles.title}>A little space{ '\n' }<Text style={styles.italic}>to think out loud.</Text></Text>
          <Text style={styles.subtitle}>No rush. No perfect words. Just you.</Text>
        </View>

        <VoiceOrb stage={stage} onPress={listening ? finishVoice : beginVoice} />

        <View style={styles.statusArea}>
          <View style={styles.waveRow}>
            <Waveform active={listening || stage === 'responding'} />
            {listening && <Text style={styles.timer}>00:{String(elapsed).padStart(2, '0')}</Text>}
          </View>
          <Animated.Text key={stage} entering={FadeIn.duration(300)} style={styles.status} accessibilityLiveRegion="polite" testID="status-label">
            {status[stage]}
          </Animated.Text>
          <View style={styles.statusHint}>
            {listening ? <Touch testID="cancel-button" accessibilityRole="button" accessibilityLabel="Cancel voice demo" onPress={replay} style={styles.cancel}>
              <X size={11} color={colors.muted} /><Text style={styles.hintText}>Cancel</Text>
            </Touch> : <Text style={styles.hintText}>{stage === 'idle' ? 'Tap the orb to try a voice conversation' : stage === 'replied' ? 'Tap the orb whenever you’re ready' : ' '}</Text>}
          </View>
        </View>

        <Animated.View layout={LinearTransition.duration(320)} style={styles.conversation} testID="conversation">
          {stage === 'idle' ? (
            <Animated.View key={`welcome-${turn}`} entering={enter} exiting={FadeOut.duration(120)} style={styles.welcome}>
              <View style={styles.assistantLabel}><Leaf size={13} color="#698656" strokeWidth={1.5} /><Text style={styles.speaker}>MURMUR</Text></View>
              <Text style={styles.welcomeText}>You don’t have to have it all figured out.{ '\n' }Start wherever you are.</Text>
            </Animated.View>
          ) : listening ? (
            <Animated.View key={`transcript-${turn}`} entering={FadeIn.duration(200)} style={styles.transcript}>
              <Text style={styles.speaker}>YOUR WORDS, UNFOLDING</Text>
              <Text style={styles.transcriptText} testID="transcript">{transcript || 'Take your time…'}<Text style={styles.cursor}> ▍</Text></Text>
            </Animated.View>
          ) : (
            <View key={`turn-${turn}`} style={styles.messages}>
              <Animated.View entering={enter} style={styles.userBubble} testID="user-bubble">
                <Text style={styles.userText}>{prompt}</Text>
                <Check size={12} color="#6F8862" strokeWidth={1.6} />
              </Animated.View>
              <Animated.View entering={reduced ? FadeIn.duration(100) : FadeInDown.delay(160).springify().damping(21).stiffness(170)} layout={LinearTransition.duration(220)} style={styles.assistantBubble}>
                <View style={styles.assistantLabel}><Leaf size={13} color="#698656" strokeWidth={1.5} /><Text style={styles.speaker}>MURMUR</Text></View>
                {stage === 'thinking' ? <ThinkingDots /> : <Text style={styles.replyText} testID="reply-text">{reply}<Text style={styles.cursor}>{stage === 'responding' ? ' ▍' : ''}</Text></Text>}
              </Animated.View>
            </View>
          )}
        </Animated.View>

        {stage === 'idle' && <View style={styles.suggestions}>
          <Text style={styles.suggestionsLabel}>OR, START WITH A LITTLE NUDGE</Text>
          <View style={styles.chips}>
            {SUGGESTIONS.map((suggestion, index) => <Touch key={suggestion} testID={`suggestion-${index}`} accessibilityRole="button" onPress={() => submit(suggestion)} style={({ pressed }) => [styles.chip, pressed && styles.chipHover]}>
              <Text style={styles.chipText}>{suggestion}</Text><ArrowUpRight size={12} color={colors.muted} />
            </Touch>)}
          </View>
        </View>}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: framed ? 12 : Math.max(insets.bottom, 16) }]}>
        <View style={[styles.composer, focused && styles.composerFocused, busy && styles.composerBusy]}>
          <TextInput ref={inputRef} testID="message-input" accessibilityLabel="Type a message" placeholder="Or put it into words…" placeholderTextColor="#8B9489"
            value={input} onChangeText={setInput} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={styles.input}
            editable={!busy} maxLength={280} onSubmitEditing={() => submit()} returnKeyType="send" blurOnSubmit />
          <Touch testID="send-button" accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{ disabled: !canSend }} disabled={!canSend}
            onPress={() => submit()} style={[styles.send, canSend && styles.sendActive]}>
            <ArrowUp size={18} strokeWidth={1.8} color={canSend ? colors.paper : '#A4ADA0'} />
          </Touch>
        </View>
        <View style={styles.demoNote}>
          <View style={styles.demoDot} /><Text style={styles.demoText}>A voice interaction demo</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 10 },
  reset: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 }, scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 18 },
  hero: { alignItems: 'center', marginTop: 12 },
  eyebrowRow: { flexDirection: 'row', gap: 7, alignItems: 'center', marginBottom: 13 },
  tinyDot: { width: 4, height: 4, borderRadius: 3, backgroundColor: '#86A566' },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 8.5, letterSpacing: 1.65, color: colors.muted },
  title: { fontFamily: fonts.display, fontSize: 39, lineHeight: 40, color: colors.ink, textAlign: 'center', letterSpacing: -0.8 },
  italic: { fontFamily: fonts.italic, color: '#698254' },
  subtitle: { fontFamily: fonts.regular, fontSize: 11.5, lineHeight: 19, color: colors.muted, marginTop: 9 },
  statusArea: { marginTop: -8, alignItems: 'center' },
  waveRow: { height: 31, flexDirection: 'row', alignItems: 'center', gap: 10 },
  timer: { fontFamily: fonts.medium, fontSize: 9, fontVariant: ['tabular-nums'], color: '#748363', position: 'absolute', left: 175 },
  status: { fontFamily: fonts.medium, fontSize: 12, color: colors.ink, lineHeight: 20, marginTop: 6 },
  statusHint: { height: 26, justifyContent: 'center' },
  hintText: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted },
  cancel: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  conversation: { minHeight: 102, marginTop: 10, justifyContent: 'center' },
  welcome: { paddingHorizontal: 19, paddingVertical: 17, backgroundColor: colors.paper, borderRadius: 20, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#E9EBE2' },
  assistantLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  speaker: { fontFamily: fonts.semibold, fontSize: 8, letterSpacing: 1.4, color: '#728267' },
  welcomeText: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 21, color: colors.ink },
  transcript: { minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 15 },
  transcriptText: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: colors.ink, textAlign: 'center' },
  cursor: { color: '#7E9C61' },
  messages: { gap: 12 },
  userBubble: { alignSelf: 'flex-end', maxWidth: '92%', backgroundColor: '#E4ECD9', borderRadius: 17, borderBottomRightRadius: 4, paddingHorizontal: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  userText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 19, color: colors.ink, flexShrink: 1 },
  assistantBubble: { backgroundColor: colors.paper, borderWidth: 1, borderColor: '#E9EBE2', borderRadius: 19, borderBottomLeftRadius: 5, padding: 16, minHeight: 80 },
  replyText: { fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 21, color: colors.ink },
  suggestions: { marginTop: 14, gap: 8 },
  suggestionsLabel: { fontFamily: fonts.medium, fontSize: 7.5, letterSpacing: 1.15, color: '#7C8774', textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 9, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E0E5D8', borderRadius: 20 },
  chipHover: { backgroundColor: '#EAF0E1', borderColor: '#A6B895' },
  chipText: { fontFamily: fonts.medium, fontSize: 9.5, color: '#64745C' },
  footer: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: colors.canvas },
  composer: { flexDirection: 'row', alignItems: 'center', height: 50, paddingLeft: 16, paddingRight: 7, borderWidth: 1, borderColor: '#DDE3D5', borderRadius: 26, backgroundColor: colors.paper },
  composerFocused: { borderColor: '#809E68', boxShadow: '0px 0px 0px 3px rgba(128,158,104,0.1)' },
  composerBusy: { opacity: 0.5 },
  input: { flex: 1, minWidth: 0, fontFamily: fonts.regular, fontSize: 12, color: colors.ink, height: 46, outlineWidth: 0 },
  send: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#EFF2E9', alignItems: 'center', justifyContent: 'center' },
  sendActive: { backgroundColor: colors.ink },
  demoNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingTop: 13, paddingBottom: 3 },
  demoDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#91A27C' },
  demoText: { fontFamily: fonts.regular, fontSize: 8.5, color: '#829077' },
});
