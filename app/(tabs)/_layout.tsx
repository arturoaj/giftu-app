import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.innerHTML = `
        body, #root { overflow: auto !important; height: auto !important; }
        .r-overflow-x-hidden, .r-overflow-y-hidden { overflow: visible !important; }
        [data-testid="tab-content"], .css-view-175oi2r { overflow: visible !important; height: auto !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

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
      <Tabs.Screen name="verificar-email" />
    </Tabs>
  );
}