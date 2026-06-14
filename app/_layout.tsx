import './global.css';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { migrateDbIfNeeded } from '@/db/database';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SQLiteProvider databaseName="wardrobe.db" onInit={migrateDbIfNeeded}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="clothing/add" options={{ title: 'Add Clothing', presentation: 'modal' }} />
        <Stack.Screen name="clothing/[id]" options={{ title: 'Clothing Detail' }} />
        <Stack.Screen name="location/add" options={{ title: 'Add Location', presentation: 'modal' }} />
        <Stack.Screen name="location/[id]" options={{ title: 'Location' }} />
      </Stack>
    </SQLiteProvider>
  );
}
