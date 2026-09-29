import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ArchiveProvider } from './src/context/ArchiveContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ArchiveProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </ArchiveProvider>
  );
}
