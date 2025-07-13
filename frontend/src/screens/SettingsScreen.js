import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getData, updateSettings } from '../utils/api';

export default function SettingsScreen() {
  const [email, setEmail] = useState('');
  const [alignerFrequency, setAlignerFrequency] = useState('');
  const [dailyGoal, setDailyGoal] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getData();
      const settings = Object.fromEntries(data.settings.slice(1));
      setEmail(settings.email || '');
      setAlignerFrequency(settings.aligner_frequency || '');
      setDailyGoal(settings.daily_goal || '');
    } catch (e) {
      console.log('Error loading settings', e);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      await updateSettings([
        ['email', email],
        ['aligner_frequency', alignerFrequency],
        ['daily_goal', dailyGoal],
      ]);
      Alert.alert('ההגדרות נשמרו בהצלחה');
    } catch (e) {
      console.log('Error saving settings', e);
      Alert.alert('אירעה שגיאה בשמירה');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>כתובת מייל לקבלת תזכורות:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>תדירות החלפת קשתית (בימים):</Text>
      <TextInput
        style={styles.input}
        value={alignerFrequency}
        onChangeText={setAlignerFrequency}
        keyboardType="numeric"
      />

      <Text style={styles.label}>יעד יומי בשעות:</Text>
      <TextInput
        style={styles.input}
        value={dailyGoal}
        onChangeText={setDailyGoal}
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        <Button title="שמור" onPress={save} color="#00cfff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    writingDirection: 'rtl',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 20,
  },
});