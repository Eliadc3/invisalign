// frontend/src/screens/HomeScreen.js

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadTime();
  }, []);

  useEffect(() => {
    saveTime();
  }, [seconds]);

  const start = () => {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const pause = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSeconds(0);
    AsyncStorage.removeItem('timerSeconds');
  };

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const saveTime = async () => {
    try {
      await AsyncStorage.setItem('timerSeconds', seconds.toString());
    } catch (e) {
      console.log('Failed to save time');
    }
  };

  const loadTime = async () => {
    try {
      const saved = await AsyncStorage.getItem('timerSeconds');
      if (saved !== null) {
        setSeconds(parseInt(saved));
      }
    } catch (e) {
      console.log('Failed to load time');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      {!running ? (
        <Button title={seconds === 0 ? 'התחל' : 'המשך'} onPress={start} />
      ) : (
        <Button title="השהה" onPress={pause} />
      )}
      <View style={{ marginTop: 10 }}>
        <Button title="איפוס" onPress={reset} color="gray" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  timerText: {
    fontSize: 48,
    marginBottom: 20,
    writingDirection: 'rtl',
  },
});