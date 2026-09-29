import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ImportScreen from '../screens/ImportScreen';
import FileDetailScreen from '../screens/FileDetailScreen';
import TagManagerScreen from '../screens/TagManagerScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Digital Archive' }} />
        <Stack.Screen name="Import" component={ImportScreen} options={{ title: 'Import Files' }} />
        <Stack.Screen name="FileDetail" component={FileDetailScreen} options={{ title: 'File Details' }} />
        <Stack.Screen name="TagManager" component={TagManagerScreen} options={{ title: 'Manage Tags' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
