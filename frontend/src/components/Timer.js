import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getTimerState, updateTimerState } from '../utils/api';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    loadTimerState();
    return () => clearInterval(intervalRef.current);
  }, []);

  const loadTimerState = async () => {
    try {
      const state = await getTimerState();
      if (state.status === 'running' && state.startTime) {
        startTimeRef.current = state.startTime;
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        setSeconds(elapsed);
        startInterval(state.startTime);
        setRunning(true);
      } else if (state.status === 'paused' && state.startTime && state.pausedTime) {
        const elapsed = Math.floor((state.pausedTime - state.startTime) / 1000);
        setSeconds(elapsed);
        startTimeRef.current = state.startTime;
        setRunning(false);
      }
    } catch (e) {
      console.error('Failed to load timer state:', e);
    }
  };

  const startInterval = (startTime) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(elapsed);
    }, 1000);
  };

  const start = async () => {
    if (running) return;
    const startTime = Date.now();
    startTimeRef.current = startTime;
    setRunning(true);
    startInterval(startTime);
    await updateTimerState({ status: 'running', startTime, pausedTime: null });
  };

  const pause = async () => {
    if (!running) return;
    clearInterval(intervalRef.current);
    setRunning(false);
    const pausedTime = Date.now();
    await updateTimerState({
      status: 'paused',
      startTime: startTimeRef.current,
      pausedTime,
    });
  };

  const reset = async () => {
    clearInterval(intervalRef.current);
    setSeconds(0);
    setRunning(false);
    startTimeRef.current = null;
    await updateTimerState({ status: 'reset', startTime: null, pausedTime: null });
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
        <Button title={seconds === 0 ? 'התחל' : 'המשך'} onPress={start} />
      ) : (
        <Button title="השהה" onPress={pause} />
      )}
      <Button title="איפוס" onPress={reset} />
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