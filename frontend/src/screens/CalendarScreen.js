import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/events'); // שנה ל־Render אם צריך
      const data = await res.json();

      const marks = {};
      data.forEach(event => {
        const color = event.type === 'aligner'
          ? 'blue'
          : event.type === 'doctor'
          ? 'green'
          : 'orange';

        // תמיכה באירועים מרובים באותו יום
        if (marks[event.date]) {
          marks[event.date].dots.push({ color });
        } else {
          marks[event.date] = {
            dots: [{ color }],
            marked: true
          };
        }
      });

      setMarkedDates(marks);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View>
      <Calendar
        markedDates={markedDates}
        markingType={'multi-dot'}
        firstDay={0} // 0 = Sunday
      />
    </View>
  );
}