// frontend/src/navigation/BottomTabNavigator.js

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { I18nManager } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import HomeScreen from '../screens/HomeScreen';
import AlignersScreen from '../screens/AlignersScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  // ודא שהממשק RTL (פועל רק בהרצה הראשונה של האפליקציה)
  I18nManager.allowRTL(true);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00cfff',
        tabBarInactiveTintColor: '#ccc',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'ראשי':
              iconName = 'home-outline';
              break;
            case 'קשתיות':
              iconName = 'medkit-outline';
              break;
            case 'יומן':
              iconName = 'calendar-outline';
              break;
            case 'הגדרות':
              iconName = 'settings-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="הגדרות" component={SettingsScreen} />
      <Tab.Screen name="יומן" component={CalendarScreen} />
      <Tab.Screen name="קשתיות" component={AlignersScreen} />
      <Tab.Screen name="ראשי" component={HomeScreen} />
    </Tab.Navigator>
  );
}