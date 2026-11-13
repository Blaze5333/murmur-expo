import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ArrowDownRight, BatteryFull, Circle, MoveUpRight, Signal, Wifi } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { Brand } from './components/Brand';
import { ConversationScreen } from './screens/ConversationScreen';
import { colors, fonts } from './theme';

export function Showcase() {
  const { width, height } = useWindowDimensions();
  const desktop = Platform.OS === 'web' && width >= 900;
  const reduced = useReducedMotion();
  if (!desktop) return <ConversationScreen />;

  return <ScrollView contentContainerStyle={[styles.page, { minHeight: height }]}>
    <View style={styles.topbar}>
      <Brand />
      <View style={styles.topNote}><View style={styles.dot} /><Text style={styles.note}>A SMALL INTERACTION. CAREFULLY MADE.</Text></View>
    </View>
    <View style={styles.layout}>
      <Animated.View entering={reduced ? FadeIn : FadeInDown.duration(800).delay(100)} style={styles.story}>
        <View style={styles.kicker}><View style={styles.shortLine} /><Text style={styles.kickerText}>A QUIETER KIND OF CONVERSATION</Text></View>
        <Text accessibilityRole="header" style={styles.headline}>Less noise.{ '\n' }<Text style={styles.headlineItalic}>More you.</Text></Text>
        <Text style={styles.description}>Some thoughts just need a little room.{ '\n' }Speak, pause, and see where a{ '\n' }conversation takes you.</Text>
        <View style={styles.try}><Text style={styles.tryText}>YOUR FIRST WORD IS THE START</Text><ArrowDownRight size={23} color={colors.ink} strokeWidth={1.2} /></View>
        <View style={styles.steps}>
          {[['01', 'Speak freely'], ['02', 'Take a breath'], ['03', 'Find a little clarity']].map(([number, label]) => <View key={number} style={styles.step}>
            <Text style={styles.stepNumber}>{number}</Text><Text style={styles.stepLabel}>{label}</Text>
          </View>)}
        </View>
        <View style={styles.signature}><Circle size={10} color="#8AA374" strokeWidth={1.3} /><Text style={styles.signatureText}>A voice interaction study</Text></View>
      </Animated.View>
      <Animated.View entering={reduced ? FadeIn : FadeInDown.duration(950).delay(180)} style={styles.previewArea}>
        <View style={styles.phoneShadow} />
        <View style={[styles.phone, { height: Math.max(740, Math.min(850, height - 132)) }]} testID="phone-preview">
          <View style={styles.phoneStatus}><Text style={styles.clock}>9:41</Text><View style={styles.phoneStatusIcons}><Signal size={13} color={colors.ink} fill={colors.ink} /><Wifi size={14} color={colors.ink} /><BatteryFull size={19} color={colors.ink} /></View></View>
          <ConversationScreen framed />
          <View style={styles.homeIndicator}><View style={styles.homeBar} /></View>
        </View>
        <View style={styles.previewLabel}><View style={styles.dot} /><Text style={styles.previewText}>LIVE PROTOTYPE</Text><MoveUpRight size={11} color="#789268" /></View>
      </Animated.View>
    </View>
    <View style={styles.pageFooter}><Text style={styles.footerText}>MADE TO FEEL A LITTLE MORE HUMAN.</Text><Text style={styles.footerText}>MURMUR · MOTION STUDY 001</Text></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: '#EEEFE7', paddingHorizontal: 64, paddingTop: 30, paddingBottom: 24 },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1250, alignSelf: 'center', width: '100%' },
  topNote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#88A571' },
  note: { fontFamily: fonts.medium, fontSize: 9, letterSpacing: 1.5, color: '#6F7D66' },
  layout: { flex: 1, width: '100%', maxWidth: 1090, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 50, paddingVertical: 26 },
  story: { flex: 1, maxWidth: 510, paddingBottom: 20 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 27 },
  shortLine: { width: 23, height: 1, backgroundColor: '#7F916A' },
  kickerText: { fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 1.4, color: '#67775C' },
  headline: { fontFamily: fonts.display, fontSize: 99, lineHeight: 96, letterSpacing: -3, color: colors.ink },
  headlineItalic: { fontFamily: fonts.italic, color: '#71885B' },
  description: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 28, color: '#74806D', marginTop: 27 },
  try: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 35 },
  tryText: { fontFamily: fonts.semibold, fontSize: 9, letterSpacing: 1.6, color: colors.ink },
  steps: { marginTop: 50, borderTopWidth: 1, borderTopColor: '#D7DFCF', paddingTop: 22, flexDirection: 'row', gap: 28 },
  step: { gap: 8 }, stepNumber: { fontFamily: fonts.regular, fontSize: 9, color: '#88957D' },
  stepLabel: { fontFamily: fonts.medium, fontSize: 11, color: '#586D4E' },
  signature: { flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 35 },
  signatureText: { fontFamily: fonts.regular, fontSize: 10, color: '#87917C' },
  previewArea: { alignItems: 'center', width: 414 },
  phoneShadow: { position: 'absolute', width: 290, height: 620, borderRadius: 160, top: 80, backgroundColor: '#D8DFC9', boxShadow: '0px 30px 100px 40px rgba(94,119,71,0.10)' },
  phone: { width: 392, borderRadius: 44, borderWidth: 6, borderColor: '#FFFEFC', backgroundColor: colors.canvas, overflow: 'hidden', boxShadow: '0px 30px 65px rgba(48,65,31,0.13), 0px 2px 7px rgba(48,65,31,0.06)' },
  phoneStatus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 27, height: 36, paddingTop: 7 },
  clock: { fontFamily: fonts.semibold, fontSize: 11, color: colors.ink },
  phoneStatusIcons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  homeIndicator: { height: 16, alignItems: 'center', justifyContent: 'center' },
  homeBar: { width: 106, height: 4, borderRadius: 3, backgroundColor: '#C5CCBD' },
  previewLabel: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18 },
  previewText: { fontFamily: fonts.medium, fontSize: 8, letterSpacing: 1.7, color: '#7C8C6F' },
  pageFooter: { width: '100%', maxWidth: 1250, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingTop: 9 },
  footerText: { fontFamily: fonts.regular, fontSize: 8, letterSpacing: 1.3, color: '#8B967F' },
});
