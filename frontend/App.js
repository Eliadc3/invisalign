import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getData } from './src/utils/api.js';

export default function App() {
  const [secondsToday, setSecondsToday] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [currentAligner, setCurrentAligner] = useState(null);
  const [goal, setGoal] = useState(22 * 3600); // ברירת מחדל 22 שעות
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveTimer();
  }, [secondsToday]);

  const loadData = async () => {
    const data = await getData();
    const today = new Date().toISOString().slice(0, 10);

    const aligners = data?.aligners?.slice(1) || [];
    const settings = data?.settings?.slice(1) || [];
    const foundGoal = settings.find(s => s[0] === 'daily_goal');
    if (foundGoal) setGoal(Number(foundGoal[1]) * 3600);

    const todayAligner = aligners.find(row => row[2] <= today && row[3] >= today);
    if (todayAligner) {
      setCurrentAligner({
        name: todayAligner[0],
        id: todayAligner[1],
        start: todayAligner[2],
        end: todayAligner[3]
      });
    }

    const stored = await AsyncStorage.getItem(`timer-${today}`);
    if (stored) setSecondsToday(Number(stored));
    setLoading(false);
  };

  const saveTimer = async () => {
    const today = new Date().toISOString().slice(0, 10);
    await AsyncStorage.setItem(`timer-${today}`, secondsToday.toString());
  };

  const startTimer = () => {
    if (!isRunning) {
      const id = setInterval(() => {
        setSecondsToday(prev => prev + 1);
      }, 1000);
      setIntervalId(id);
      setIsRunning(true);
    }
  };

  const stopTimer = () => {
    clearInterval(intervalId);
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearInterval(intervalId);
    setSecondsToday(0);
    setIsRunning(false);
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator size="large" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>מעקב קשתיות</Text>

      {currentAligner ? (
        <>
          <Text style={styles.sub}>קשתית נוכחית: {currentAligner.name}</Text>
          <Text style={styles.sub}>תאריכים: {currentAligner.start} - {currentAligner.end}</Text>
        </>
      ) : (
        <Text style={styles.sub}>אין קשתית נוכחית</Text>
      )}

      <Text style={styles.timer}>{formatTime(secondsToday)} / {formatTime(goal)}</Text>
      <Text style={styles.status}>{secondsToday >= goal ? '✔️ הגעת ליעד היומי!' : '⏳ המשך להרכיב את הקשתית'}</Text>

      <View style={styles.buttons}>
        <Button title={isRunning ? "השהה" : "התחל"} onPress={isRunning ? stopTimer : startTimer} />
        <Button title="איפוס" onPress={resetTimer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f0f4f7'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16
  },
  sub: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 4
  },
  timer: {
    fontSize: 36,
    textAlign: 'center',
    marginVertical: 16
  },
  status: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  }
});
