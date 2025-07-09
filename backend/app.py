# backend/app.py

from flask import Flask, request, jsonify
from sheets import get_sheet_data, append_row, update_settings_data, update_aligner_image_url
from mailer import send_email
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
import os
import uuid
from datetime import datetime, timedelta

app = Flask(__name__)

DRIVE_FOLDER_ID = '1Wyd36JOHS6X_Id7SI4YpHTUeMnnCFeaz'

@app.route('/sync', methods=['GET'])
def sync():
    data = {
        "aligners": get_sheet_data('Aligners!A:E'),
        "events": get_sheet_data('Events!A:F'),
        "settings": get_sheet_data('Settings!A:B')
    }
    return jsonify(data)

@app.route('/event', methods=['POST'])
def event():
    e = request.json or {}
    row = [e.get(k) for k in ('id', 'date', 'type', 'title', 'note', 'email')]
    append_row('Events!A:F', row)
    return jsonify({'status': 'ok'})

@app.route('/settings', methods=['POST'])
def update_settings():
    body = request.json or {}
    rows = body.get('rows', [])
    update_settings_data(rows)
    return jsonify({'status': 'saved'})

@app.route('/send-email', methods=['POST'])
def send_mail_endpoint():
    body = request.json or {}
    send_email(body.get('to'), body.get('subject'), body.get('body'))
    return jsonify({'status': 'sent'})

@app.route('/events')
def get_events():
    events = []
    sheet_id = os.environ.get('SHEET_ID')
    if not sheet_id:
        return jsonify({"error": "SHEET_ID not defined"}), 500

    aligner_rows = get_sheet_data('Aligners!A2:D')
    for row in aligner_rows:
        if len(row) >= 3:
            start_date = row[2]
            events.append({"date": start_date, "type": "aligner"})

    appointments = get_sheet_data('Appointments!A2:B')
    for row in appointments:
        if len(row) >= 1:
            events.append({"date": row[0], "type": "appointment"})

    return jsonify(events)

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

# ✅ /daily-reminder: מופעל ע"י Zapier לפי שעה
@app.route('/daily-reminder', methods=['GET'])
def daily_reminder():
    reminder_type = request.args.get('type')
    if not reminder_type:
        return jsonify({"error": "Missing type parameter"}), 400

    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    events = get_sheet_data('Events!A2:F')

    for row in events:
        date, type_, title, note, email = row[1:6]

        if reminder_type == 'night' and date == tomorrow and type_ == 'aligner':
            subject = 'מחר תחליף קשתית'
        elif reminder_type == 'morning' and date == today and type_ == 'aligner':
            subject = 'היום תחליף קשתית'
        elif reminder_type == 'missed' and type_ == 'aligner':
            aligner_date = datetime.strptime(date, '%Y-%m-%d')
            missed_date = (aligner_date + timedelta(days=1)).strftime('%Y-%m-%d')
            if missed_date == today:
                subject = 'שכחת להחליף קשתית אתמול'
            else:
                continue
        elif reminder_type == 'doctor' and date == tomorrow and type_ == 'doctor':
            subject = 'תזכורת: תור לרופא מחר'
        elif reminder_type == 'doctor-today' and date == today and type_ == 'doctor':
            subject = 'היום יש לך תור לרופא'
        else:
            continue

        body = f"{subject}\n{title}\n{note}"
        send_email(email, subject, body)

    return jsonify({'status': f'reminders sent for type {reminder_type}'})

if __name__ == '__main__':
    app.run(debug=True)