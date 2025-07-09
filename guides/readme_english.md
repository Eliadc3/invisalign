# Invisalign Tracker – User Guide

### 🔍 What does the app do?

This app helps you track your Invisalign treatment:

- Daily timer for wearing the aligner
- Display of current aligner phase
- Syncs with Google Sheets (backend database)
- Color-coded calendar (appointments, aligner changes, notes)
- Sends reminder emails for aligner switch or doctor appointments
- Upload and view teeth images per aligner

---

## 📄 Project Structure

```
invisalign/
├── frontend/               # Expo App
│   ├── App.js
│   ├── app.json
│   └── src/
│       ├── navigation/BottomTabNavigator.js
│       ├── screens/{Home,Aligners,Calendar,Settings}Screen.js
│       ├── components/
│       │   ├── Timer.js
│       │   ├── AlignerCard.js
│       │   └── CalendarLegend.js
│       └── utils/{api.js,storage.js,notifications.js}
├── backend/                # Flask server
│   ├── app.py
│   ├── sheets.py
│   ├── mailer.py
│   ├── scheduler.py
│   ├── .env.example
│   └── requirements.txt
```

---

## ✅ How to Run It

### 𝘺𝘼𝘾𝙊𝙙𝙒️ Frontend (Expo)

1. Install Expo CLI if not already installed:

```bash
npm install -g expo-cli
```

2. Inside the `frontend/` folder:

```bash
npm install
npx expo start
```

3. Scan the QR code using **Expo Go** app on your iPhone

### 𝘺𝘼𝙋𝙎 Backend (Flask API)

1. Create a `.env` file inside the `backend/` folder:

```env
SHEET_ID=your_google_sheet_id
SMTP_USER=youremail@gmail.com
SMTP_PASS=xxxxxx
```

2. Inside the `backend/` folder:

```bash
pip install -r requirements.txt
python app.py
```

3. Visit [http://127.0.0.1:5000/sync](http://127.0.0.1:5000/sync) to test API

---

## 🔃 What is saved and where?

- Each aligner, appointment or event is saved to your **Google Sheet**
- Settings changes are updated in the `Settings` sheet
- Timer progress is saved locally with AsyncStorage
- At 7:00pm daily, a background script sends reminder emails
- Aligner photos are uploaded to **Google Drive**, and linked in the sheet

---

## ⚖️ What can be edited in the app?

| Screen   | Editable Options                           |
| -------- | ------------------------------------------ |
| Settings | Email, Aligner Frequency, Daily Hour Goal  |
| Calendar | Events marked by type (dot color)          |
| Aligners | Synced and displayed from the Google Sheet |

---

## 🧪 Checklist for Testing

- ✅ Is `/sync` returning expected data?
- ✅ Can you add aligners or events and see them in the calendar?
- ✅ Are emails being sent properly? (check `SMTP_USER` works)
- ✅ Does the app open and run cleanly on your iPhone?
- ✅ Can you upload and view photos per aligner?

---

## 🚚 Deployment on Render

1. Sign up at [https://render.com](https://render.com)
2. Click "New" → Web Service → Connect your backend GitHub repo
3. Use:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. Also create a Worker service for `scheduler.py`
5. Add environment variables (`.env`)

---

## ✨ Done!

Your Invisalign Tracker app is ready for real-time use. It supports:

- Hebrew RTL interface
- Color-coded calendar and reminders
- Cloud syncing with Google Sheets
- Daily usage timer
- Scheduled email alerts via Render
- Per-aligner photo uploads linked in Drive

Just deploy the backend and scan the Expo QR – you're live!
