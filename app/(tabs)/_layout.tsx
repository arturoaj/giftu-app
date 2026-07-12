import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="registro" />
      <Stack.Screen name="crear-evento" />
      <Stack.Screen name="evento-detalle" />
      <Stack.Screen name="unirse" />
      <Stack.Screen name="participante-evento" />
      <Stack.Screen name="verificar-email" />
    </Stack>
  );
}