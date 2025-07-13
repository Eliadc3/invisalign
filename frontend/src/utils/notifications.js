import * as Notifications from 'expo-notifications';
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

  scheduleNotification(
    'מחר יש להחליף קשתית',
    `זמן להחליף ל־${aligner.name} מחר ב־20:00`,
    replaceTime(dayBefore, 20, 0)
  );

  scheduleNotification(
    'היום תחליף קשתית',
    `זה הזמן להחליף ל־${aligner.name}.`,
    replaceTime(endDate, 20, 0)
  );

  if (!replaced) {
    scheduleNotification(
      'האם שכחת להחליף קשתית?',
      `האם כבר החלפת ל־${aligner.name}?`,
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
    'תזכורת: תור לרופא מחר',
    'יש לך מחר ביקורת אצל הרופא.',
    replaceTime(dayBefore, 8)
  );

  scheduleNotification(
    'היום יש לך תור לרופא',
    'היום זה התור שלך לבדיקה אצל הרופא.',
    replaceTime(date, 8)
  );
}