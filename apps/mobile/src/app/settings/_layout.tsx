import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="notifications" />
      <Stack.Screen name="security" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="export" />
    </Stack>
  );
}
