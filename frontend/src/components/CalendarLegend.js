// frontend/src/components/CalendarLegend.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CalendarLegend() {
  return (
    <View style={styles.legendContainer}>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: 'blue' }]} />
        <Text>החלפת קשתית</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: 'green' }]} />
        <Text>תור לרופא</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: 'orange' }]} />
        <Text>הערה / אחר</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legendContainer: {
    marginVertical: 12,
    paddingHorizontal: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginRight: 8
  }
});