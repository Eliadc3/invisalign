// frontend/src/components/PhotoUploader.js

import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from '../utils/api';

export default function PhotoUploader({ alignerId }) {
  const [uploading, setUploading] = useState(false);

  const handlePickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageFile = result.assets[0];
    if (!imageFile || !imageFile.uri) {
      Alert.alert('שגיאה', 'לא נבחרה תמונה תקינה');
      return;
    }

    setUploading(true);

    try {
      await uploadPhoto(alignerId, imageFile);
      Alert.alert('הצלחה', 'התמונה הועלתה בהצלחה!');
    } catch (e) {
      Alert.alert('שגיאה', 'אירעה שגיאה בעת ההעלאה');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Button title="העלה תמונה" onPress={handlePickAndUpload} />
      {uploading && <ActivityIndicator style={{ marginTop: 8 }} />}
    </View>
  );
}