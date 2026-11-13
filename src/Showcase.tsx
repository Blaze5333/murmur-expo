import { StyleSheet, View } from 'react-native';
import { ConversationScreen } from './screens/ConversationScreen';
import { Viewport } from './components/Viewport';

export function Showcase() {
  return (
    <Viewport>
      <View style={styles.workspace}>
        <ConversationScreen />
      </View>
    </Viewport>
  );
}

const styles = StyleSheet.create({
  workspace: {
    flex: 1,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E5E7EB',
  },
});
