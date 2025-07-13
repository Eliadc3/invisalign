import { BASE_URL } from '@env';

export const getData = async () => {
  try {
    const res = await fetch(`${BASE_URL}/sync`);
    return await res.json();
  } catch (e) {
    console.error('getData error:', e);
    return {};
  }
};

export const getCalendarEvents = async () => {
  try {
    const res = await fetch(`${BASE_URL}/events`);
    return await res.json();
  } catch (e) {
    console.error('getCalendarEvents error:', e);
    return [];
  }
};

export const addEvent = async (event) => {
  try {
    await fetch(`${BASE_URL}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (e) {
    console.error('addEvent error:', e);
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await fetch(`${BASE_URL}/delete-event/${eventId}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.error('deleteEvent error:', e);
  }
};

export const updateSettings = async (rows) => {
  try {
    await fetch(`${BASE_URL}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows }),
    });
  } catch (e) {
    console.error('updateSettings error:', e);
  }
};

export const uploadPhoto = async (alignerId, imageFile) => {
  const formData = new FormData();
  formData.append('id', alignerId);
  formData.append('image', {
    uri: imageFile.uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  });

  const res = await fetch(`${BASE_URL}/upload-photo`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!res.ok) throw new Error('Upload failed');
  return await res.json();
};

export const sendEmail = async (to, subject, body) => {
  try {
    await fetch(`${BASE_URL}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body }),
    });
  } catch (e) {
    console.error('sendEmail error:', e);
  }
};

export const getTimerState = async () => {
  try {
    const res = await fetch(`${BASE_URL}/timer-state`);
    return await res.json();
  } catch (e) {
    console.error('getTimerState error:', e);
    return null;
  }
};

export const updateTimerState = async (data) => {
  try {
    await fetch(`${BASE_URL}/update-timer-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error('updateTimerState error:', e);
  }
};