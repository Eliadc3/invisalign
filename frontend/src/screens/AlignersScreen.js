// frontend/src/screens/AlignersScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getData } from '../utils/api';

export default function AlignersScreen() {
  const [aligners, setAligners] = useState([]);

  useEffect(() => {
    fetchAligners();
  }, []);

  const fetchAligners = async () => {
    try {
      const data = await getData();
      const sheet = data?.aligners || [];
      const parsed = sheet.slice(1).map(row => ({
        id: row[0],
        set: row[1],
        number: row[2],
        startDate: row[3],
        endDate: row[4],
        status: row[5],
      }));
      setAligners(parsed);
    } catch (e) {
      console.log('Error loading aligners', e);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>קשתית {item.number} (סט {item.set})</Text>
      <Text>התחלה: {item.startDate}</Text>
      <Text>סיום: {item.endDate}</Text>
      <Text style={{ fontWeight: 'bold', color: item.status === 'Active' ? 'green' : 'gray' }}>
        {item.status === 'Active' ? 'פעילה' : 'הושלמה'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={aligners}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>אין קשתיות להצגה</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    writingDirection: 'rtl',
  },
});