import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

export function Viewport({ children }: PropsWithChildren) {
  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6F8' },
});
