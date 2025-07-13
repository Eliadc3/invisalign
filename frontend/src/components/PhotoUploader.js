import React, { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadPhoto } from '../utils/api';

export default function PhotoUploader({ alignerId, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const pickImage = async () => {
    await handleImagePick(ImagePicker.launchImageLibraryAsync);
  };

  const takePhoto = async () => {
    await handleImagePick(ImagePicker.launchCameraAsync);
  };

  const handleImagePick = async (pickerFunction) => {
    const result = await pickerFunction({
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
      const response = await uploadPhoto(alignerId, imageFile);
      setUploadedUrl(response.url);
      Alert.alert('הצלחה', 'התמונה הועלתה בהצלחה!');
      if (onUploadSuccess) onUploadSuccess(response.url);
    } catch (e) {
      console.error(e);
      Alert.alert('שגיאה', 'אירעה שגיאה בעת ההעלאה');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Button title="בחר תמונה מהגלריה" onPress={pickImage} />
      <View style={{ height: 8 }} />
      <Button title="צלם תמונה" onPress={takePhoto} />

      {uploading && <ActivityIndicator style={{ marginTop: 8 }} />}

      {uploadedUrl && (
        <Image
          source={{ uri: uploadedUrl }}
          style={{ width: '100%', height: 200, marginTop: 8, borderRadius: 8 }}
        />
      )}
    </View>
  );
}