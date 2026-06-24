import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="registro" />
      <Tabs.Screen name="crear-evento" />
      <Tabs.Screen name="evento-detalle" />
      <Tabs.Screen name="unirse" />
      <Tabs.Screen name="participante-evento" />
    </Tabs>
  );
}