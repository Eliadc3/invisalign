import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Modal, Button, TextInput, StyleSheet, FlatList, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getCalendarEvents, addEvent, deleteEvent } from '../utils/api';
import CalendarLegend from '../components/CalendarLegend';

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({ type: '', title: '', note: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await getCalendarEvents();
      const marks = {};

      data.forEach(event => {
        const color = getDotColor(event.type);

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
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDotColor = (type) => {
    switch(type) {
      case 'aligner': return 'blue';
      case 'doctor': return 'green';
      case 'note': return 'orange';
      default: return 'gray';
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleAddEvent = async () => {
    const event = {
      id: Date.now().toString(),
      date: selectedDate,
      type: newEvent.type,
      title: newEvent.title,
      note: newEvent.note,
      email: '', // אופציונלי
    };
    await addEvent(event);
    setModalVisible(false);
    setNewEvent({ type: '', title: '', note: '' });
    fetchEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'אישור מחיקה',
      'האם אתה בטוח שברצונך למחוק אירוע זה?',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'מחק', style: 'destructive', onPress: async () => {
            await deleteEvent(eventId);
            fetchEvents();
          }
        }
      ]
    );
  };

  const eventsForSelectedDate = events.filter(e => e.date === selectedDate);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={{ flex:1 }}>
      <Calendar
        markedDates={markedDates}
        markingType={'multi-dot'}
        firstDay={0}
        onDayPress={handleDayPress}
      />

      <CalendarLegend />

      {selectedDate && (
        <View style={{ padding: 12 }}>
          <Text style={styles.heading}>אירועים ב־{selectedDate}:</Text>
          <FlatList
            data={eventsForSelectedDate}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.eventRow}>
                <Text>• [{item.type}] {item.title}: {item.note}</Text>
                <Button title="מחק" onPress={() => handleDeleteEvent(item.id)} color="red" />
              </View>
            )}
          />
          <Button title="הוסף אירוע חדש" onPress={() => setModalVisible(true)} />
        </View>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text>הוסף אירוע לתאריך: {selectedDate}</Text>

          <TextInput
            placeholder="סוג האירוע (aligner/doctor/note)"
            value={newEvent.type}
            onChangeText={text => setNewEvent({ ...newEvent, type: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="כותרת"
            value={newEvent.title}
            onChangeText={text => setNewEvent({ ...newEvent, title: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="הערה"
            value={newEvent.note}
            onChangeText={text => setNewEvent({ ...newEvent, note: text })}
            style={styles.input}
          />

          <Button title="שמור אירוע" onPress={handleAddEvent} />
          <Button title="ביטול" onPress={() => setModalVisible(false)} color="gray" />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  }
});