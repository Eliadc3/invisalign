// frontend/src/components/Timer.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadTime();
  }, []);

  useEffect(() => {
    saveTime();
  }, [seconds]);

  const loadTime = async () => {
    try {
      const saved = await AsyncStorage.getItem('timer_seconds');
      if (saved !== null) setSeconds(parseInt(saved));
    } catch (e) {
      console.error('Failed to load time');
    }
  };

  const saveTime = async () => {
    try {
      await AsyncStorage.setItem('timer_seconds', seconds.toString());
    } catch (e) {
      console.error('Failed to save time');
    }
  };

  const start = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const pause = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
  };

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setSeconds(0);
  };

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      {!running ? (
        <Button title={seconds === 0 ? "Start" : "Resume"} onPress={start} />
      ) : (
        <Button title="Pause" onPress={pause} />
      )}
      <Button title="Reset" onPress={reset} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  timerText: {
    fontSize: 48,
    marginBottom: 20
  }
});