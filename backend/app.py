# backend/app.py

from flask import Flask, request, jsonify
from sheets import get_sheet_data, append_row, update_settings_data, update_aligner_image_url
from mailer import send_email
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
import os
import uuid

app = Flask(__name__)

# מזהה תיקיית Drive – ודא שהוא נכון
DRIVE_FOLDER_ID = '1Wyd36JOHS6X_Id7SI4YpHTUeMnnCFeaz'

# ✅ החזרת כל הנתונים (קשתיות, אירועים, הגדרות)
@app.route('/sync', methods=['GET'])
def sync():
    data = {
        "aligners": get_sheet_data('Aligners!A:E'),
        "events": get_sheet_data('Events!A:F'),
        "settings": get_sheet_data('Settings!A:B')
    }
    return jsonify(data)

# ✅ הוספת אירוע חדש ל-Google Sheets
@app.route('/event', methods=['POST'])
def event():
    e = request.json or {}
    row = [e.get(k) for k in ('id', 'date', 'type', 'title', 'note', 'email')]
    append_row('Events!A:F', row)
    return jsonify({'status': 'ok'})

# ✅ עדכון הגדרות
@app.route('/settings', methods=['POST'])
def update_settings():
    body = request.json or {}
    rows = body.get('rows', [])
    update_settings_data(rows)
    return jsonify({'status': 'saved'})

# ✅ שליחת מייל
@app.route('/send-email', methods=['POST'])
def send_mail_endpoint():
    body = request.json or {}
    send_email(body.get('to'), body.get('subject'), body.get('body'))
    return jsonify({'status': 'sent'})

# ✅ שליפת תאריכים מסומנים ליומן
@app.route('/events')
def get_events():
    events = []

    sheet_id = os.environ.get('SHEET_ID')
    if not sheet_id:
        return jsonify({"error": "SHEET_ID not defined"}), 500

    # קשתיות
    aligner_rows = get_sheet_data('Aligners!A2:D')
    for row in aligner_rows:
        if len(row) >= 3:
            start_date = row[2]
            events.append({"date": start_date, "type": "aligner"})

    # תורים לרופא
    appointments = get_sheet_data('Appointments!A2:B')
    for row in appointments:
        if len(row) >= 1:
            events.append({"date": row[0], "type": "appointment"})

    return jsonify(events)

# ✅ העלאת תמונה + עדכון URL בגיליון
@app.route('/upload-photo', methods=['POST'])
def upload_photo():
    file = request.files.get('image')
    aligner_id = request.form.get('id')
    if not file or not aligner_id:
        return jsonify({'error': 'Missing file or aligner ID'}), 400

    filename = f"temp_{uuid.uuid4().hex}.jpg"
    file.save(filename)

    creds = service_account.Credentials.from_service_account_file(
        'invisalign1-key.json',
        scopes=['https://www.googleapis.com/auth/drive']
    )
    drive_service = build('drive', 'v3', credentials=creds)

    file_metadata = {
        'name': f'aligner_{aligner_id}.jpg',
        'parents': [DRIVE_FOLDER_ID]
    }
    media = MediaFileUpload(filename, mimetype='image/jpeg')
    uploaded = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields='id'
    ).execute()

    file_id = uploaded.get('id')
    drive_service.permissions().create(
        fileId=file_id,
        body={'role': 'reader', 'type': 'anyone'},
    ).execute()

    image_url = f"https://drive.google.com/uc?id={file_id}"

    os.remove(filename)
    update_aligner_image_url(aligner_id, image_url)

    return jsonify({'url': image_url})

if __name__ == '__main__':
    app.run(debug=True)