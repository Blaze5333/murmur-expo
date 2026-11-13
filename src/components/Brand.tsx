import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export function Brand({ small = false }: { small?: boolean }) {
  return <View style={styles.brand}>
    <View style={[styles.mark, small && styles.small]}>
      {[12, 21, 16].map((height, index) => <View key={index} style={[styles.stroke, { height: small ? height * 0.7 : height }]} />)}
    </View>
    <Text style={[styles.wordmark, small && styles.smallWordmark]}>murmur<Text style={styles.period}>.</Text></Text>
  </View>;
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 },
  small: { width: 28, height: 28, borderRadius: 10, gap: 2.5 },
  stroke: { width: 3, borderRadius: 3, backgroundColor: colors.lime, transform: [{ rotate: '12deg' }] },
  wordmark: { fontFamily: fonts.bold, fontSize: 25, color: colors.ink, letterSpacing: -1.2 },
  smallWordmark: { fontSize: 23 },
  period: { color: '#82A35E' },
});
