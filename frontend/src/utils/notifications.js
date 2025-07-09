import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';

export async function requestNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotification(title, body, dateTime) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      date: new Date(dateTime),
    },
  });
}

export function scheduleAlignerNotifications(aligner, replaced = false) {
  if (!aligner || !aligner.endDate) return;

  const endDate = new Date(aligner.endDate);
  const dayBefore = new Date(endDate);
  dayBefore.setDate(endDate.getDate() - 1);

  const dayAfter = new Date(endDate);
  dayAfter.setDate(endDate.getDate() + 1);

  const replaceTime = (date, hour, min) => {
    const dt = new Date(date);
    dt.setHours(hour, min, 0, 0);
    return dt;
  };

  // Reminder the day before
  scheduleNotification(
    'Reminder: Change Aligner Tomorrow',
    `${aligner.name} is due tomorrow.`,
    replaceTime(dayBefore, 20, 0)
  );

  // Reminder the same day
  scheduleNotification(
    'Today: Change Your Aligner',
    `It's time to change to ${aligner.name}.`,
    replaceTime(endDate, 20, 0)
  );

  // Reminder the day after – only if not replaced
  if (!replaced) {
    scheduleNotification(
      'You forgot to change aligner?',
      `Did you switch to ${aligner.name}?`,
      replaceTime(dayAfter, 6, 0)
    );
  }
}

export function scheduleAppointmentNotifications(appointmentDate) {
  if (!appointmentDate) return;

  const date = new Date(appointmentDate);
  const dayBefore = new Date(date);
  dayBefore.setDate(date.getDate() - 1);

  const replaceTime = (d, h) => {
    const dt = new Date(d);
    dt.setHours(h, 0, 0, 0);
    return dt;
  };

  scheduleNotification(
    'Reminder: Doctor Appointment Tomorrow',
    'You have a check-up scheduled tomorrow.',
    replaceTime(dayBefore, 8)
  );

  scheduleNotification(
    'Doctor Appointment Today',
    'Today is your Invisalign check-up.',
    replaceTime(date, 8)
  );
}