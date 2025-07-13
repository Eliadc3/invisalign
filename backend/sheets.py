import gspread
import os
from google.oauth2.service_account import Credentials

# טוען האישורים מתוך קובץ ה-JSON
scope = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

CREDENTIALS_PATH = os.getenv('GOOGLE_CREDENTIALS_PATH')
creds = Credentials.from_service_account_file(CREDENTIALS_PATH, scopes=scope)
client = gspread.authorize(creds)

def get_sheet_data(range_: str):
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.values_get(range_)
    return worksheet.get('values', [])

def append_row(range_: str, row: list):
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet(range_.split('!')[0])
    worksheet.append_row(row)

def update_settings_data(rows: list):
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Settings")
    worksheet.clear()
    worksheet.append_rows(rows)

def update_aligner_status(aligner_id, status):
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Aligners")
    rows = worksheet.get_all_records()

    for i, row in enumerate(rows, start=2):  # מתחיל בשורה השנייה
        if str(row.get("ID")) == str(aligner_id):
            worksheet.update_cell(i, 7, status)  # נניח שהסטטוס בעמודה 7
            break

def update_aligner_image_url(aligner_id, image_url):
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Aligners")
    rows = worksheet.get_all_records()
    for i, row in enumerate(rows, start=2):  # Starts at row 2
        if str(row.get("ID")) == str(aligner_id):
            worksheet.update_cell(i, 5, image_url)  # Assuming column E = 5
            break

def get_all_events():
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")
    sheet = client.open_by_key(sheet_id)

    aligners = sheet.worksheet("Aligners").get_all_records()
    appointments = sheet.worksheet("Appointments").get_all_records()

    return aligners, appointments

# ✅ פונקציות חדשות לטיימר בענן
def get_timer_state():
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Settings")
    values = worksheet.get('B2:D2')[0]
    status, start_time, paused_time = values
    return {
        "status": status,
        "startTime": int(start_time) if start_time else None,
        "pausedTime": int(paused_time) if paused_time else None
    }

def update_timer_state(data):
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        raise Exception("Missing SHEET_ID")
    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Settings")

    status = data.get("status", "")
    start_time = str(data.get("startTime") or "")
    paused_time = str(data.get("pausedTime") or "")

    worksheet.update({'range':'B2:D2', 'values':[[status, start_time, paused_time]]})

def update_event_in_sheet(event_data):
    sheet_id = os.environ.get('SHEET_ID')
    if not sheet_id:
        raise Exception("Missing SHEET_ID")

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Events")
    rows = worksheet.get_all_values()

    for idx, row in enumerate(rows):
        if row and row[0] == str(event_data['id']):
            worksheet.update({
        'range': f'A{idx+1}:F{idx+1}',
        'values': [
        [
            event_data.get('id', ''),
            event_data.get('date', ''),
            event_data.get('type', ''),
            event_data.get('title', ''),
            event_data.get('note', ''),
            event_data.get('email', '')
        ]
    ]
})
            return True
    return False


def delete_event_in_sheet(event_id):
    sheet_id = os.environ.get('SHEET_ID')
    if not sheet_id:
        raise Exception("Missing SHEET_ID")

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Events")
    rows = worksheet.get_all_values()

    for idx, row in enumerate(rows):
        if row and row[0] == event_id:
            worksheet.delete_rows(idx + 1)
            return True
    return False