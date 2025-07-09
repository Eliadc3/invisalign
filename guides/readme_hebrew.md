# Invisalign Tracker – מדריך שימוש

### 🔍 מה האפליקציה עושה?
האפליקציה עוזרת לך לעקוב אחרי טיפול Invisalign:
- מודדת זמן יומי של חבישת הקשתית (טיימר)
- מציגה באיזה שלב אתה נמצא
- שולפת ומעדכנת נתונים מתוך Google Sheets
- מציגה יומן צבעוני (תור, החלפת קשתית, הערות)
- שולחת מייל תזכורת לקראת החלפה/תור רופא

---

## 📄 מה כלול בפרויקט?

```
invisalign/
├── frontend/               # אפליקציית Expo
│   ├── App.js
│   ├── app.json
│   └── src/
│       ├── navigation/BottomTabNavigator.js
│       ├── screens/{Home,Aligners,Calendar,Settings}Screen.js
│       ├── utils/{api,storage,push}.js
├── backend/                # שרת Flask
│   ├── app.py
│   ├── sheets.py
│   ├── mailer.py
│   ├── scheduler.py
│   ├── .env.example
│   └── requirements.txt
```

---

## ✅ איך מפעילים?

### ᴺᵃᴾᵉʰᴸʰᵒ️ Frontend (Expo App)

1. התקן את Expo CLI (אם לא מותקן)
```bash
npm install -g expo-cli
```
2. בתיקיית `frontend/`:
```bash
npm install
npx expo start
```
3. סרוק את הקוד עם אפליקציית **Expo Go** באייפון שלך

### ᴺᵃᴸᵗʰ Backend (Flask API)

1. צור קובץ `.env` בתיקיית `backend/` עם:
```env
SHEET_ID=your_google_sheet_id
SMTP_USER=youremail@gmail.com
SMTP_PASS=xxxxxx
```
2. בתיקיית `backend/`:
```bash
pip install -r requirements.txt
python app.py
```
3. בדוק ב־http://127.0.0.1:5000/sync


---

## 🔃 מה נשמר ואיך?

- כל קשתית/תור/אירוע נשמר בשורה בגיליון `Google Sheets`
- כל שינוי שנעשה בטופס ההגדרות נכתב לשונית `Settings`
- זמני הטיימר נשמרים ב־AsyncStorage מקומית
- בכל יום ב־19:00 מתבצעת שליחה אוטומטית של מייל תזכורת (Render worker)

---

## ⚖️ אופציות עריכה באפליקציה:

| מסך | מה אפשר לערוך |
|------|----------------|
| “הגדרות” | אימייל, תדירות החלפה, יעד שעות יומי |
| “יומן” | תאריכים עם נקודות צבעוניות |
| “קשתיות” | מתעדכן אוטומטית לפי הגיליון |

---

## ᴺᵃˡᵗ𝔢ʳ𝔢𝔢 - בדיקות מומלצות:
- ✅ האם `/sync` מחזיר נתונים תקינים?
- ✅ האם אפשר לשמור קשתית או תור והם מופיעים ביומן?
- ✅ האם מייל נשלח למשתמש (בדוק `SMTP_USER`)?
- ✅ האם הקוד נפתח תקין באייפון?

---

## 🚚 שלבים לפריסה ב־Render

1. פתח חשבון ב־https://render.com
2. לחץ New → Web Service → חבר את ריפו ה־backend
3. בחר:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. צור גם Worker לפריסה של `scheduler.py`
5. הגדר משתני סביבה (`.env`)

---

## ✨ סיום:
האפליקציה מוכנה לשימוש ופריסה, עם תמיכה מלאה בעברית, יומן צבעוני, טיימר, וסנכרון ל־Google Sheets + מיילים.
אם תפרוס את ה־Backend ב־Render ותשתף את ה־Expo – תוכל להשתמש בזה באייפון כמו אפליקציה רגילה!

