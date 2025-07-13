from flask import Flask, request, jsonify
from sheets import get_sheet_data, append_row, update_settings_data,update_aligner_image_url, get_timer_state, update_timer_state, client
from mailer import send_email
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account
from dotenv import load_dotenv
import os
import uuid
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)

DRIVE_FOLDER_ID = os.getenv('DRIVE_FOLDER_ID')

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
    try:
        events = []
        sheet_id = os.environ.get('SHEET_ID')
        if not sheet_id:
            raise ValueError("SHEET_ID not defined")

        aligner_rows = get_sheet_data('Aligners!A2:D')
        for row in aligner_rows:
            if len(row) >= 3:
                start_date = row[2]
                events.append({"date": start_date, "type": "aligner"})

        events_rows = get_sheet_data('Events!A2:F')
        for row in events_rows:
            if len(row) >= 2:
                events.append({"date": row[0], "type": row[1]})

        return jsonify(events)

    except Exception as e:
        print(f"❌ Error in /events: {e}")
        return jsonify({"error": str(e)}), 500

# backend/app.py

@app.route('/update-event', methods=['POST'])
def update_event():
    body = request.json
    if not body or 'id' not in body:
        return jsonify({'error': 'Missing event ID'}), 400

    sheet_id = os.environ.get('SHEET_ID')
    if not sheet_id:
        return jsonify({"error": "SHEET_ID not defined"}), 500

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Events")
    rows = worksheet.get_all_values()

    for idx, row in enumerate(rows):
        if row and row[0] == str(body['id']):
            worksheet.update({
            'range': f'A{idx+1}:F{idx+1}',
            'values': [
            [
                body.get('id', ''),
                body.get('date', ''),
                body.get('type', ''),
                body.get('title', ''),
                body.get('note', ''),
                body.get('email', '')
            ]]})
            return jsonify({'status': 'updated'})

    return jsonify({'error': 'Event not found'}), 404
@app.route('/delete-event/<event_id>', methods=['DELETE'])
def delete_event(event_id):
    sheet_id = os.environ.get('SHEET_ID')
    if not sheet_id:
        return jsonify({"error": "SHEET_ID not defined"}), 500

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Events")
    rows = worksheet.get_all_values()

    for idx, row in enumerate(rows):
        if row and str(row[0]) == str(event_id):
            worksheet.delete_rows(idx + 1)
            return jsonify({'status': 'deleted'})

    return jsonify({'error': 'Event not found'}), 404

@app.route('/update-aligner-status', methods=['POST'])
def update_aligner_status():
    data = request.json or {}
    aligner_id = data.get('alignerId')
    new_status = data.get('status')

    if not aligner_id or not new_status:
        return jsonify({'error': 'Missing alignerId or status'}), 400

    from sheets import update_aligner_status
    update_aligner_status(aligner_id, new_status)

    return jsonify({'status': 'updated'})

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

@app.route('/daily-reminder', methods=['GET'])
def daily_reminder():
    reminder_type = request.args.get('type')
    if not reminder_type:
        return jsonify({"error": "Missing type parameter"}), 400

    today = datetime.now().strftime('%Y-%m-%d')
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    events = get_sheet_data('Events!A2:E')

    for row in events:
        if len(row) < 6:
            continue

        date, type_, title, note, email = row[1:6]

        if reminder_type == 'aligner-tomorrow' and date == tomorrow and type_ == 'aligner':
            subject = 'מחר תחליף קשתית'
        elif reminder_type == 'aligner-today' and date == today and type_ == 'aligner':
            subject = 'היום תחליף קשתית'
        elif reminder_type == 'missed' and type_ == 'aligner':
            try:
                aligner_date = datetime.strptime(date, '%Y-%m-%d')
                missed_date = (aligner_date + timedelta(days=1)).strftime('%Y-%m-%d')
                if missed_date == today:
                    subject = 'שכחת להחליף קשתית אתמול'
                else:
                    continue
            except ValueError:
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

@app.route('/timer/status', methods=['GET'])
def timer_status():
    state = get_timer_state()
    return jsonify(state)

@app.route('/timer/update', methods=['POST'])
def timer_update():
    data = request.json or {}
    update_timer_state(data)
    return jsonify({"status": "updated"})

if __name__ == '__main__':
    app.run(debug=True)