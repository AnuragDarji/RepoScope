import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack 
       screenOptions={{
        animation: "slide_from_right",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="repo/[owner]/[repo]" options={{ title: 'Repository Detail' }} />
    </Stack>
  );
}