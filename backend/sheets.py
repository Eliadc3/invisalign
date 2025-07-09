import gspread
import os
from google.oauth2.service_account import Credentials

# הרשאות Google API
scope = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

creds = Credentials.from_service_account_file("invisalign1-key.json", scopes=scope)
client = gspread.authorize(creds)


def get_sheet_data(range_: str, sheet_id: str | None = None):
    sheet_id = sheet_id or os.environ.get("SHEET_ID")
    if not sheet_id:
        raise ValueError("Missing SHEET_ID")

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.values_get(range_)
    return worksheet.get('values', [])


def append_row(range_: str, row: list, sheet_id: str | None = None):
    sheet_id = sheet_id or os.environ.get("SHEET_ID")
    if not sheet_id:
        raise ValueError("Missing SHEET_ID")

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet(range_.split('!')[0])
    worksheet.append_row(row)


def update_settings_data(rows: list, sheet_id: str | None = None):
    sheet_id = sheet_id or os.environ.get("SHEET_ID")
    if not sheet_id:
        raise ValueError("Missing SHEET_ID")

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Settings")
    worksheet.clear()
    worksheet.append_rows(rows)


def update_aligner_image_url(aligner_id: str, image_url: str, sheet_id: str | None = None):
    sheet_id = sheet_id or os.environ.get("SHEET_ID")
    if not sheet_id:
        raise ValueError("Missing SHEET_ID")

    sheet = client.open_by_key(sheet_id)
    worksheet = sheet.worksheet("Aligners")
    rows = worksheet.get_all_records()
    for i, row in enumerate(rows, start=2):  # מתחיל משורה 2 (כותרות בשורה 1)
        if str(row.get("ID")) == str(aligner_id):
            worksheet.update_cell(i, 5, image_url)  # עמודה E = 5
            break