import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Button, Alert } from 'react-native';
import { scheduleAlignerNotifications } from '../utils/notifications';
import PhotoUploader from '../components/PhotoUploader';
import { updateAlignerStatus } from '../utils/api';

export default function AlignerCard({ aligner }) {
    const [status, setStatus] = useState(aligner.status);

    const handleConfirmReplaced = async () => {
        if (status === 'Completed') {
            Alert.alert('הקשתית כבר סומנה כהוחלפה');
            return;
        }

        scheduleAlignerNotifications(aligner, true);
        await updateAlignerStatus(aligner.id, 'Completed');
        setStatus('Completed');
        Alert.alert('הקשתית סומנה כהוחלפה');
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{aligner.name}</Text>
            <Text style={styles.dates}>{aligner.startDate} - {aligner.endDate}</Text>
            <Text style={[styles.status, { color: status === 'Active' ? 'green' : 'gray' }]}>Status: {status}</Text>

            {(aligner.image_url || aligner["Image URL"]) && (
                <Image
                    source={{ uri: aligner.image_url || aligner["Image URL"] }}
                    style={styles.image}
                />
            )}

            <PhotoUploader alignerId={aligner.id} />

            {aligner.notes && (
                <Text style={styles.notes}>Notes: {aligner.notes}</Text>
            )}

            <Button title="הוחלף" onPress={handleConfirmReplaced} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        padding: 16,
        margin: 12,
        borderRadius: 12,
        elevation: 2
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4
    },
    dates: {
        fontSize: 14,
        color: '#555'
    },
    status: {
        fontSize: 14,
        marginTop: 4
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        marginTop: 8,
        borderRadius: 8
    },
    notes: {
        fontSize: 13,
        marginTop: 8,
        color: '#333'
    }
});