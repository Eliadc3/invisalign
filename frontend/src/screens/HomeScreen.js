import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { getData, getTimerState, updateTimerState, sendEmail } from '../utils/api';

export default function HomeScreen() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAligner, setCurrentAligner] = useState(null);
  const [goal, setGoal] = useState(22 * 3600);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [nextAlignerDate, setNextAlignerDate] = useState('');
  const [nextDoctorAppointment, setNextDoctorAppointment] = useState('לא קיים תור לרופא');

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    loadData();
    return () => clearInterval(intervalRef.current);
  }, []);

  const loadData = async () => {
    try {
      const data = await getData();
      const today = new Date().toISOString().slice(0, 10);

      const aligners = data?.aligners?.slice(1) || [];
      const settings = data?.settings?.slice(1) || [];
      const events = data?.events?.slice(1) || [];

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

      const foundEmail = settings.find(s => s[0] === 'email');
      if (foundEmail) setEmail(foundEmail[1]);

      // החלפה קרובה
      const upcomingAligner = aligners.find(row => row[2] > today);
      setNextAlignerDate(upcomingAligner ? upcomingAligner[2] : 'אין החלפה קרובה');

      // תור לרופא קרוב
      const doctorAppointments = events
        .filter(e => e[1] === 'doctor' && e[0] >= today)
        .sort((a, b) => a[0].localeCompare(b[0]));
      setNextDoctorAppointment(doctorAppointments[0]?.[0] || 'לא קיים תור לרופא');

      await loadTimerState();

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimerState = async () => {
    const state = await getTimerState();
    if (state.status === 'running' && state.startTime) {
      startTimeRef.current = state.startTime;
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      setSeconds(elapsed);
      startInterval(state.startTime);
      setIsRunning(true);
    } else if (state.status === 'paused' && state.startTime && state.pausedTime) {
      const elapsed = Math.floor((state.pausedTime - state.startTime) / 1000);
      setSeconds(elapsed);
      startTimeRef.current = state.startTime;
      setIsRunning(false);
    }
  };

  const startInterval = (startTime) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(elapsed);
    }, 1000);
  };

  const handleStart = async () => {
    if (isRunning) return;
    const startTime = Date.now();
    startTimeRef.current = startTime;
    setIsRunning(true);
    startInterval(startTime);
    await updateTimerState({ status: 'running', startTime, pausedTime: null });
  };

  const handlePause = async () => {
    if (!isRunning) return;
    clearInterval(intervalRef.current);
    setIsRunning(false);
    const pausedTime = Date.now();
    await updateTimerState({
      status: 'paused',
      startTime: startTimeRef.current,
      pausedTime,
    });
  };

  const handleReset = async () => {
    clearInterval(intervalRef.current);
    setSeconds(0);
    setIsRunning(false);
    startTimeRef.current = null;
    await updateTimerState({ status: 'reset', startTime: null, pausedTime: null });
  };

  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert('שגיאה', 'לא מוגדר אימייל למשתמש');
      return;
    }
    await sendEmail(email, 'תזכורת קשתית', 'הגיע הזמן להחליף קשתית!');
    Alert.alert('הצלחה', 'נשלחה תזכורת במייל');
  };

  const formatTime = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
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

      <Text style={styles.timer}>{formatTime(seconds)} / {formatTime(goal)}</Text>
      <Text style={styles.status}>{seconds >= goal ? '✔️ הגעת ליעד היומי!' : '⏳ המשך להרכיב את הקשתית'}</Text>

      <Text style={styles.next}>החלפה קרובה: {nextAlignerDate}</Text>
      <Text style={styles.next}>תור לרופא: {nextDoctorAppointment}</Text>

      <View style={styles.buttons}>
        {!isRunning ? (
          <Button title={seconds === 0 ? 'התחל' : 'המשך'} onPress={handleStart} />
        ) : (
          <Button title="השהה" onPress={handlePause} />
        )}
        <Button title="איפוס" onPress={handleReset} color="gray" />
        <Button title="שלח תזכורת במייל" onPress={handleSendEmail} />
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
  next: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 4
  },
  buttons: {
    marginTop: 20,
    alignItems: 'center',
    gap: 10
  }
});