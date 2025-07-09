// frontend/src/components/CalendarLegend.js
// מציג מקרא צבעים ליומן (כחול, ירוק, כתום) בצורה ברורה ונגישה
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CalendarLegend() {
  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendItem}><Text style={[styles.dot, { backgroundColor: 'blue' }]} /> Aligner Change</Text>
      <Text style={styles.legendItem}><Text style={[styles.dot, { backgroundColor: 'green' }]} /> Doctor Appointment</Text>
      <Text style={styles.legendItem}><Text style={[styles.dot, { backgroundColor: 'orange' }]} /> Note / Other</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legendContainer: {
    flexDirection: 'column',
    marginVertical: 12,
    paddingHorizontal: 16
  },
  legendItem: {
    fontSize: 14,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginRight: 8,
    display: 'inline-block'
  }
});