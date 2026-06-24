import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { IdiomaProvider } from './IdiomaContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  if (Platform.OS === 'web') {
    return (
      <IdiomaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={styles.container}>
            <View style={styles.phone}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
            </View>
          </View>
          <StatusBar style="auto" />
        </ThemeProvider>
      </IdiomaProvider>
    );
  }

  return (
    <IdiomaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </IdiomaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
    minHeight: '100vh' as any,
  },
  phone: {
    width: 390,
    height: '100vh' as any,
    overflow: 'hidden' as any,
    backgroundColor: '#0D0D0D',
    boxShadow: '0 0 60px rgba(139, 92, 246, 0.3)' as any,
  },
});