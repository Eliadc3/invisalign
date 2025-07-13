# backend/scheduler.py

import schedule
import time
import os
from datetime import datetime, timedelta
from sheets import get_sheet_data
from mailer import send_email
from dotenv import load_dotenv

# טוען משתני סביבה (כולל SHEET_ID)
load_dotenv()

def send_reminders():
    sheet_id = os.environ.get("SHEET_ID")
    if not sheet_id:
        print("⚠️ SHEET_ID not defined in .env")
        return

    tomorrow = (datetime.today() + timedelta(days=1)).strftime('%Y-%m-%d')
    events = get_sheet_data(range_='Events!A:F')[1:]

    for row in events:
        if len(row) < 6:
            continue  # דילוג על שורות לא תקינות

        _, date, type_, title, note, email = row[:6]

        if date == tomorrow:
            subject = 'תזכורת' if type_ == 'note' else (
                'מחר תחליף קשתית' if type_ == 'aligner' else 'מחר תור לרופא'
            )
            body = f"התזכורת שלך ל־{date}:\n{title}\n{note or ''}"
            send_email(email, subject, body)
            print(f"✅ Email sent to {email} for {type_} on {date}")

# כל יום בשעה 19:00 בדיוק
schedule.every().day.at("19:00").do(send_reminders)

if __name__ == "__main__":
    print("🔁 Scheduler started. Waiting for 19:00 daily jobs...")
    while True:
        schedule.run_pending()
        time.sleep(60)