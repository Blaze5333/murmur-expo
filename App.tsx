import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Showcase } from './src/Showcase';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Showcase />
    </SafeAreaProvider>
  );
}
