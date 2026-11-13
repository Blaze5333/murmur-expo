import { type ComponentRef, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ArrowUp, Mic, Square } from 'lucide-react-native';
import { fonts } from '../theme';

type Props = {
  busy: boolean;
  ready: boolean;
  onSend: (text: string) => boolean;
  onVoice: () => void;
  onCancel: () => void;
};

export function Composer({ busy, ready, onSend, onVoice, onCancel }: Props) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const [height, setHeight] = useState(26);
  const canSend = ready && !busy && text.trim().length > 0;

  function submit() {
    if (onSend(text)) {
      setText('');
      setHeight(26);
      input.current?.focus();
      // Keep focus: sending another message should not close/reopen the keyboard.
    }
  }

  return (
    <View
      testID="composer"
      style={[styles.composer, focused && styles.focused]}
    >
      <TextInput
        ref={input}
        testID="message-input"
        accessibilityLabel="Message"
        placeholder="Write a message…"
        placeholderTextColor="#858D99"
        value={text}
        onChangeText={setText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onContentSizeChange={(event) =>
          setHeight(
            Math.max(26, Math.min(120, event.nativeEvent.contentSize.height)),
          )
        }
        onKeyPress={(event) => {
          const key = event.nativeEvent as typeof event.nativeEvent & {
            shiftKey?: boolean;
            isComposing?: boolean;
          };
          if (
            Platform.OS === 'web' &&
            key.key === 'Enter' &&
            !key.shiftKey &&
            !key.isComposing
          ) {
            event.preventDefault();
            submit();
          }
        }}
        onSubmitEditing={Platform.OS === 'web' ? undefined : submit}
        submitBehavior={Platform.OS === 'web' ? 'newline' : 'submit'}
        multiline
        maxLength={4000}
        editable={ready}
        selectionColor="#315BEE"
        style={[styles.input, { height }]}
      />
      <View style={styles.actions}>
        <Pressable
          testID="voice-button"
          accessibilityRole="button"
          accessibilityLabel="Try voice demo"
          disabled={!ready || busy}
          onPress={onVoice}
          style={({ pressed }) => [
            styles.voice,
            pressed && styles.pressed,
            (!ready || busy) && styles.disabled,
          ]}
        >
          <Mic size={21} color="#647084" strokeWidth={2} />
        </Pressable>
        <Pressable
          testID={busy ? 'stop-button' : 'send-button'}
          accessibilityRole="button"
          accessibilityLabel={busy ? 'Stop reply' : 'Send message'}
          accessibilityState={{ disabled: !busy && !canSend }}
          disabled={!busy && !canSend}
          onPress={busy ? onCancel : submit}
          style={({ pressed }) => [
            styles.send,
            !busy && !canSend && styles.inactive,
            pressed && styles.pressed,
          ]}
        >
          {busy ? (
            <Square size={14} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <ArrowUp
              size={21}
              color={canSend ? '#FFFFFF' : '#9BA3AF'}
              strokeWidth={2.3}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E3E6EC',
    backgroundColor: '#F8F9FB',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  focused: {
    borderColor: '#315BEE',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 0 3px rgba(49,91,238,0.1)',
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 26,
    color: '#191D24',
    padding: 0,
    paddingTop: 8,
    paddingBottom: 8,
    flex: 1,
    minWidth: 0,
    minHeight: 42,
    maxHeight: 120,
    outlineWidth: 0,
    textAlignVertical: 'top',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  voice: {
    width: 40,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  send: {
    width: 42,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#315BEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactive: { backgroundColor: '#E9ECF1' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.35 },
});
